import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IntentMatchDto, IntentUserSummaryDto } from '@bitemate/shared';
import type { FoodIntent, User } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { GeoLocationService } from '../location/geo-location.service';
import { IntentCacheService, type CachedIntentMeta } from './intent-cache.service';

type IntentWithUser = FoodIntent & {
  user: Pick<
    User,
    | 'id'
    | 'username'
    | 'fullName'
    | 'profileImage'
    | 'role'
    | 'meetupRating'
    | 'meetupReviewCount'
    | 'successfulMeetups'
    | 'isPremium'
    | 'rankScore'
  >;
};

interface ScoredIntentMatch extends IntentMatchDto {
  sortKey: number;
}

type UserSummaryFields = Pick<
  User,
  | 'id'
  | 'username'
  | 'fullName'
  | 'profileImage'
  | 'role'
  | 'meetupRating'
  | 'meetupReviewCount'
  | 'successfulMeetups'
  | 'isPremium'
  | 'rankScore'
>;

@Injectable()
export class IntentMatchingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly intentCache: IntentCacheService,
    private readonly geoLocationService: GeoLocationService,
    private readonly configService: ConfigService,
  ) {}

  async findMatches(sourceIntent: IntentWithUser): Promise<IntentMatchDto[]> {
    const maxResults = this.configService.get<number>('intent.maxMatchResults', 30)!;

    const nearbyIntents = await this.intentCache.findNearbyIntentIds({
      latitude: sourceIntent.latitude,
      longitude: sourceIntent.longitude,
      radiusKm: sourceIntent.radiusKm,
    });

    const candidateIds = nearbyIntents
      .map((item) => item.intentId)
      .filter((id) => id !== sourceIntent.id);

    const metaMap = await this.intentCache.getIntentMetaBatch(candidateIds);
    const distanceMap = new Map(nearbyIntents.map((item) => [item.intentId, item.distanceKm]));

    const intentMatches = this.scoreIntentCandidates(
      sourceIntent,
      candidateIds,
      metaMap,
      distanceMap,
    );

    const nearbyUsers = await this.geoLocationService.findNearby({
      latitude: sourceIntent.latitude,
      longitude: sourceIntent.longitude,
      radiusKm: sourceIntent.radiusKm,
      availability: 'AVAILABLE',
      excludeUserId: sourceIntent.userId,
    });

    const userIds = nearbyUsers.map((user) => user.id);
    const cancelCounts = userIds.length
      ? await this.getCancelCounts(userIds)
      : new Map<string, number>();

    const users = userIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: userIds }, isActive: true, invisibleMode: false },
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
            role: true,
            meetupRating: true,
            meetupReviewCount: true,
            successfulMeetups: true,
            isPremium: true,
            rankScore: true,
          },
        })
      : [];

    const userMap = new Map(users.map((user) => [user.id, user]));
    const userMatches = this.scoreUserCandidates(
      sourceIntent,
      nearbyUsers,
      userMap,
      cancelCounts,
    );

    const merged = new Map<string, ScoredIntentMatch>();
    for (const match of [...intentMatches, ...userMatches]) {
      const key = match.user.id;
      const existing = merged.get(key);
      if (!existing || match.score > existing.score) {
        merged.set(key, match);
      }
    }

    return [...merged.values()]
      .sort((a, b) => b.sortKey - a.sortKey)
      .slice(0, maxResults)
      .map(({ sortKey: _sortKey, ...match }) => match);
  }

  async refreshMatchesForNearbyIntents(sourceIntent: IntentWithUser): Promise<void> {
    const limit = this.configService.get<number>('intent.refreshNearbyLimit', 20)!;
    const ttl = this.configService.get<number>('intent.matchCacheTtlSeconds', 120)!;

    const nearby = await this.intentCache.findNearbyIntentIds({
      latitude: sourceIntent.latitude,
      longitude: sourceIntent.longitude,
      radiusKm: Math.max(sourceIntent.radiusKm, 10),
    });

    const targetIds = nearby
      .map((item) => item.intentId)
      .filter((id) => id !== sourceIntent.id)
      .slice(0, limit);

    if (!targetIds.length) {
      return;
    }

    const intents = await this.prisma.foodIntent.findMany({
      where: { id: { in: targetIds }, status: 'ACTIVE' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
            role: true,
            meetupRating: true,
            meetupReviewCount: true,
            successfulMeetups: true,
            isPremium: true,
            rankScore: true,
          },
        },
      },
    });

    await Promise.all(
      intents.map(async (intent) => {
        const matches = await this.findMatches(intent);
        await this.intentCache.setMatchCache(intent.id, JSON.stringify(matches), ttl);
      }),
    );
  }

  private scoreIntentCandidates(
    sourceIntent: IntentWithUser,
    candidateIds: string[],
    metaMap: Map<string, CachedIntentMeta>,
    distanceMap: Map<string, number>,
  ): ScoredIntentMatch[] {
    const matches: ScoredIntentMatch[] = [];
    const sourceStart = sourceIntent.timeStart.getTime();
    const sourceEnd = sourceIntent.timeEnd.getTime();

    for (const candidateId of candidateIds) {
      const meta = metaMap.get(candidateId);
      if (!meta || meta.status !== 'ACTIVE' || meta.userId === sourceIntent.userId) {
        continue;
      }

      const distanceKm =
        distanceMap.get(candidateId) ??
        haversineKm(
          sourceIntent.latitude,
          sourceIntent.longitude,
          Number.parseFloat(meta.latitude),
          Number.parseFloat(meta.longitude),
        );

      const maxRadius = Math.max(sourceIntent.radiusKm, Number.parseFloat(meta.radiusKm));
      if (distanceKm > maxRadius) {
        continue;
      }

      const candidateStart = new Date(meta.timeStart).getTime();
      const candidateEnd = new Date(meta.timeEnd).getTime();
      const overlapMinutes = computeOverlapMinutes(sourceStart, sourceEnd, candidateStart, candidateEnd);
      if (overlapMinutes <= 0) {
        continue;
      }

      const candidateCancelCount = Number.parseInt(meta.userCancelCount || '0', 10);
      const candidateSuccessful = Number.parseInt(meta.userSuccessfulMeetups || '0', 10);

      const breakdown = this.buildScoreBreakdown({
        distanceKm,
        maxRadiusKm: maxRadius,
        sourceFoodType: sourceIntent.foodType,
        sourceFoodCategory: sourceIntent.foodCategory,
        candidateFoodType: meta.foodType,
        candidateFoodCategory: meta.foodCategory || null,
        sourceStart,
        sourceEnd,
        candidateStart,
        candidateEnd,
        sourceRating: sourceIntent.user.meetupRating,
        candidateRating: Number.parseFloat(meta.userRating),
        successfulMeetups: candidateSuccessful,
        cancelCount: candidateCancelCount,
        isPremium: meta.isPremium === 'true',
      });

      if (breakdown.parts.foodSimilarity <= 0) {
        continue;
      }

      matches.push({
        matchType: 'INTENT',
        score: breakdown.total,
        scoreBreakdown: breakdown.parts,
        distanceKm: round2(distanceKm),
        timeOverlapMinutes: Math.round(overlapMinutes),
        user: this.metaToUserSummary(meta, candidateCancelCount, breakdown.parts.reliability),
        intent: this.metaToIntentDto(meta),
        sortKey: breakdown.total,
      });
    }

    return matches;
  }

  private scoreUserCandidates(
    sourceIntent: IntentWithUser,
    nearbyUsers: Awaited<ReturnType<GeoLocationService['findNearby']>>,
    userMap: Map<string, UserSummaryFields>,
    cancelCounts: Map<string, number>,
  ): ScoredIntentMatch[] {
    const matches: ScoredIntentMatch[] = [];
    const sourceStart = sourceIntent.timeStart.getTime();
    const sourceEnd = sourceIntent.timeEnd.getTime();

    for (const nearby of nearbyUsers) {
      const user = userMap.get(nearby.id);
      if (!user) {
        continue;
      }

      const cancelCount = cancelCounts.get(user.id) ?? 0;
      const breakdown = this.buildScoreBreakdown({
        distanceKm: nearby.distanceKm,
        maxRadiusKm: sourceIntent.radiusKm,
        sourceFoodType: sourceIntent.foodType,
        sourceFoodCategory: sourceIntent.foodCategory,
        candidateFoodType: sourceIntent.foodType,
        candidateFoodCategory: sourceIntent.foodCategory,
        sourceStart,
        sourceEnd,
        candidateStart: sourceStart,
        candidateEnd: sourceEnd,
        sourceRating: sourceIntent.user.meetupRating,
        candidateRating: user.meetupRating,
        successfulMeetups: user.successfulMeetups,
        cancelCount,
        userMatchBoost: true,
        isPremium: user.isPremium,
      });

      matches.push({
        matchType: 'USER',
        score: breakdown.total,
        scoreBreakdown: breakdown.parts,
        distanceKm: round2(nearby.distanceKm),
        timeOverlapMinutes: Math.round((sourceEnd - sourceStart) / 60_000),
        user: this.toUserSummary(user, cancelCount, breakdown.parts.reliability),
        intent: null,
        sortKey: breakdown.total,
      });
    }

    return matches;
  }

  private buildScoreBreakdown(input: {
    distanceKm: number;
    maxRadiusKm: number;
    sourceFoodType: string;
    sourceFoodCategory: string | null;
    candidateFoodType: string;
    candidateFoodCategory: string | null;
    sourceStart: number;
    sourceEnd: number;
    candidateStart: number;
    candidateEnd: number;
    sourceRating: number;
    candidateRating: number;
    successfulMeetups: number;
    cancelCount: number;
    userMatchBoost?: boolean;
    isPremium?: boolean;
  }) {
    const wDistance = this.configService.get<number>('intent.weightDistance', 40)!;
    const wFood = this.configService.get<number>('intent.weightFoodSimilarity', 25)!;
    const wTime = this.configService.get<number>('intent.weightTimeOverlap', 15)!;
    const wRating = this.configService.get<number>('intent.weightRatingSimilarity', 10)!;
    const wReliability = this.configService.get<number>('intent.weightReliability', 10)!;
    const premiumBoost = this.configService.get<number>('premium.visibilityBoost', 5)!;

    const distanceNorm = Math.max(0, 1 - input.distanceKm / Math.max(input.maxRadiusKm, 0.5));
    const foodNorm = foodSimilarityNorm(
      input.sourceFoodType,
      input.sourceFoodCategory,
      input.candidateFoodType,
      input.candidateFoodCategory,
      input.userMatchBoost,
    );
    const overlapMs = computeOverlapMs(
      input.sourceStart,
      input.sourceEnd,
      input.candidateStart,
      input.candidateEnd,
    );
    const sourceWindow = Math.max(input.sourceEnd - input.sourceStart, 1);
    const timeNorm = Math.min(1, overlapMs / sourceWindow);
    const ratingDiff = Math.abs(input.sourceRating - input.candidateRating);
    const ratingNorm = Math.max(0, 1 - ratingDiff / 5);
    const reliabilityNorm = computeReliabilityNorm(
      input.successfulMeetups,
      input.cancelCount,
      this.configService.get<number>('intent.cancelPenaltyThreshold', 3)!,
    );

    const parts = {
      distance: round2(distanceNorm * wDistance),
      foodSimilarity: round2(foodNorm * wFood),
      timeOverlap: round2(timeNorm * wTime),
      ratingSimilarity: round2(ratingNorm * wRating),
      reliability: round2(reliabilityNorm * wReliability),
    };

    const total = round2(
      parts.distance +
        parts.foodSimilarity +
        parts.timeOverlap +
        parts.ratingSimilarity +
        parts.reliability +
        (input.isPremium ? premiumBoost : 0),
    );

    return { parts, total };
  }

  private async getCancelCounts(userIds: string[]): Promise<Map<string, number>> {
    const [intentCounts, meetupCounts] = await Promise.all([
      this.prisma.foodIntent.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds }, status: 'CANCELLED' },
        _count: { _all: true },
      }),
      this.prisma.foodMeetup.groupBy({
        by: ['creatorId'],
        where: { creatorId: { in: userIds }, status: 'CANCELLED' },
        _count: { _all: true },
      }),
    ]);

    const map = new Map<string, number>();
    for (const row of intentCounts) {
      map.set(row.userId, (map.get(row.userId) ?? 0) + row._count._all);
    }
    for (const row of meetupCounts) {
      map.set(row.creatorId, (map.get(row.creatorId) ?? 0) + row._count._all);
    }
    return map;
  }

  private metaToUserSummary(
    meta: CachedIntentMeta,
    cancelCount: number,
    reliabilityScore: number,
  ): IntentUserSummaryDto {
    return {
      id: meta.userId,
      username: null,
      fullName: null,
      profileImage: null,
      role: meta.userRole || null,
      meetupRating: Number.parseFloat(meta.userRating),
      meetupReviewCount: Number.parseInt(meta.userReviewCount || '0', 10),
      successfulMeetups: Number.parseInt(meta.userSuccessfulMeetups || '0', 10),
      cancelCount,
      reliabilityScore,
      isPremium: meta.isPremium === 'true',
    };
  }

  private metaToIntentDto(meta: CachedIntentMeta) {
    return {
      id: meta.id,
      foodType: meta.foodType,
      foodCategory: meta.foodCategory || null,
      timeStart: meta.timeStart,
      timeEnd: meta.timeEnd,
      latitude: Number.parseFloat(meta.latitude),
      longitude: Number.parseFloat(meta.longitude),
      radiusKm: Number.parseFloat(meta.radiusKm),
      desiredPeople: Number.parseInt(meta.desiredPeople, 10),
      budgetMin: meta.budgetMin ? Number.parseFloat(meta.budgetMin) : null,
      budgetMax: meta.budgetMax ? Number.parseFloat(meta.budgetMax) : null,
      status: meta.status,
      expiresAt: meta.timeEnd,
      meetupId: null,
      createdAt: meta.timeStart,
    };
  }

  private toUserSummary(
    user: UserSummaryFields,
    cancelCount: number,
    reliabilityScore: number,
  ): IntentUserSummaryDto {
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      profileImage: user.profileImage,
      role: user.role,
      meetupRating: user.meetupRating,
      meetupReviewCount: user.meetupReviewCount,
      successfulMeetups: user.successfulMeetups,
      cancelCount,
      reliabilityScore,
      isPremium: user.isPremium,
    };
  }
}

function foodSimilarityNorm(
  sourceFood: string,
  sourceCategory: string | null,
  candidateFood: string,
  candidateCategory: string | null,
  userMatchBoost?: boolean,
): number {
  if (userMatchBoost) {
    return 0.65;
  }

  const sourceNorm = sourceFood.trim().toLowerCase().replace(/\s+/g, '-');
  const candidateNorm = candidateFood.trim().toLowerCase().replace(/\s+/g, '-');

  if (sourceNorm === candidateNorm) {
    return 1;
  }
  if (sourceCategory && candidateCategory && sourceCategory === candidateCategory) {
    return 0.55;
  }
  if (sourceNorm.includes(candidateNorm) || candidateNorm.includes(sourceNorm)) {
    return 0.35;
  }
  return 0;
}

function computeOverlapMs(start1: number, end1: number, start2: number, end2: number): number {
  const overlapStart = Math.max(start1, start2);
  const overlapEnd = Math.min(end1, end2);
  return Math.max(0, overlapEnd - overlapStart);
}

function computeOverlapMinutes(start1: number, end1: number, start2: number, end2: number): number {
  return computeOverlapMs(start1, end1, start2, end2) / 60_000;
}

function computeReliabilityNorm(
  successfulMeetups: number,
  cancelCount: number,
  cancelPenaltyThreshold: number,
): number {
  const total = successfulMeetups + cancelCount;
  if (total === 0) {
    return 0.85;
  }

  let reliability = successfulMeetups / total;
  if (cancelCount >= cancelPenaltyThreshold && reliability < 0.5) {
    reliability *= 0.5;
  }
  return Math.max(0, Math.min(1, reliability));
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
