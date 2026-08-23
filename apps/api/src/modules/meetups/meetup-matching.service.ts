import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { MeetupMatchDto, MeetupUserSummaryDto } from '@bitemate/shared';
import type { FoodMeetup, User } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { GeoLocationService } from '../location/geo-location.service';
import { MeetupCacheService } from './meetup-cache.service';

type MeetupWithCreator = FoodMeetup & {
  creator: Pick<
    User,
    | 'id'
    | 'username'
    | 'fullName'
    | 'profileImage'
    | 'meetupRating'
    | 'meetupReviewCount'
    | 'isPremium'
    | 'rankScore'
  >;
};

interface ScoredMatch extends MeetupMatchDto {
  sortKey: number;
}

type UserSummaryFields = Pick<
  User,
  | 'id'
  | 'username'
  | 'fullName'
  | 'profileImage'
  | 'meetupRating'
  | 'meetupReviewCount'
  | 'isPremium'
  | 'rankScore'
>;

@Injectable()
export class MeetupMatchingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly meetupCache: MeetupCacheService,
    private readonly geoLocationService: GeoLocationService,
    private readonly configService: ConfigService,
  ) {}

  async findMatches(
    meetup: MeetupWithCreator,
    requesterId: string,
  ): Promise<MeetupMatchDto[]> {
    const timeWindowMs =
      this.configService.get<number>('meetup.timeMatchWindowHours', 2)! *
      60 *
      60 *
      1000;
    const ratingTolerance = this.configService.get<number>(
      'meetup.ratingMatchTolerance',
      1.5,
    )!;
    const maxResults = this.configService.get<number>('meetup.maxMatchResults', 30)!;
    const normalizedFood = this.meetupCache.normalizeFoodType(meetup.foodType);

    const [nearbyMeetups, foodTypeIds, excludedUserIds] = await Promise.all([
      this.meetupCache.findNearbyMeetupIds({
        latitude: meetup.latitude,
        longitude: meetup.longitude,
        radiusKm: meetup.radiusKm,
      }),
      this.meetupCache.getFoodTypeMeetupIds(normalizedFood),
      this.getExcludedUserIds(meetup.id, requesterId),
    ]);

    const foodTypeIdSet = new Set(foodTypeIds);
    const candidateMeetupIds = nearbyMeetups
      .map((item) => item.meetupId)
      .filter((id) => id !== meetup.id && foodTypeIdSet.has(id));

    const meetupMatches = await this.scoreMeetupCandidates(
      meetup,
      candidateMeetupIds,
      nearbyMeetups,
      timeWindowMs,
      ratingTolerance,
      excludedUserIds,
    );

    const nearbyUsers = await this.geoLocationService.findNearby({
      latitude: meetup.latitude,
      longitude: meetup.longitude,
      radiusKm: meetup.radiusKm,
      availability: 'AVAILABLE',
      excludeUserId: requesterId,
    });

    const userIds = nearbyUsers
      .map((user) => user.id)
      .filter((id) => !excludedUserIds.has(id));

    const users = userIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: userIds }, isActive: true, invisibleMode: false },
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
            meetupRating: true,
            meetupReviewCount: true,
            isPremium: true,
            rankScore: true,
          },
        })
      : [];

    const userMap = new Map(users.map((user) => [user.id, user]));
    const userMatches = this.scoreUserCandidates(
      meetup,
      nearbyUsers,
      userMap,
      ratingTolerance,
    );

    const merged = new Map<string, ScoredMatch>();

    for (const match of [...meetupMatches, ...userMatches]) {
      const key = match.user.id;
      const existing = merged.get(key);
      if (!existing || match.score > existing.score) {
        merged.set(key, { ...match, sortKey: match.score });
      }
    }

    return [...merged.values()]
      .sort((a, b) => b.sortKey - a.sortKey)
      .slice(0, maxResults)
      .map(({ sortKey: _sortKey, ...match }) => match);
  }

  private async getExcludedUserIds(
    meetupId: string,
    requesterId: string,
  ): Promise<Set<string>> {
    const invites = await this.prisma.meetupInvite.findMany({
      where: { meetupId },
      select: { inviteeId: true, inviterId: true },
    });

    const excluded = new Set<string>([requesterId]);
    for (const invite of invites) {
      excluded.add(invite.inviteeId);
      excluded.add(invite.inviterId);
    }
    return excluded;
  }

  private async scoreMeetupCandidates(
    sourceMeetup: MeetupWithCreator,
    candidateIds: string[],
    nearbyDistances: Array<{ meetupId: string; distanceKm: number }>,
    timeWindowMs: number,
    ratingTolerance: number,
    excludedUserIds: Set<string>,
  ): Promise<ScoredMatch[]> {
    if (!candidateIds.length) {
      return [];
    }

    const distanceMap = new Map(
      nearbyDistances.map((item) => [item.meetupId, item.distanceKm]),
    );

    const candidates = await this.prisma.foodMeetup.findMany({
      where: {
        id: { in: candidateIds },
        status: 'OPEN',
        scheduledAt: {
          gte: new Date(sourceMeetup.scheduledAt.getTime() - timeWindowMs),
          lte: new Date(sourceMeetup.scheduledAt.getTime() + timeWindowMs),
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
            meetupRating: true,
            meetupReviewCount: true,
            isPremium: true,
            rankScore: true,
          },
        },
      },
    });

    const matches: ScoredMatch[] = [];

    for (const candidate of candidates) {
      if (excludedUserIds.has(candidate.creatorId)) {
        continue;
      }

      const ratingDiff = Math.abs(
        candidate.creator.meetupRating - sourceMeetup.creator.meetupRating,
      );
      if (
        sourceMeetup.creator.meetupReviewCount > 0 &&
        candidate.creator.meetupReviewCount > 0 &&
        ratingDiff > ratingTolerance
      ) {
        continue;
      }

      const distanceKm = distanceMap.get(candidate.id) ?? meetupRadiusFallback(
        sourceMeetup,
        candidate,
      );
      if (distanceKm > Math.max(sourceMeetup.radiusKm, candidate.radiusKm)) {
        continue;
      }

      const timeDiffMinutes =
        Math.abs(candidate.scheduledAt.getTime() - sourceMeetup.scheduledAt.getTime()) /
        60_000;
      const foodExact =
        this.meetupCache.normalizeFoodType(candidate.foodType) ===
        this.meetupCache.normalizeFoodType(sourceMeetup.foodType)
          ? 1
          : 0;

      const score =
        foodExact * 40 +
        Math.max(0, 30 - distanceKm * 3) +
        Math.max(0, 20 - timeDiffMinutes / 6) +
        Math.max(0, 10 - ratingDiff * 4) +
        (candidate.creator.isPremium ? 5 : 0) +
        Math.min(candidate.creator.rankScore * 0.05, 15);

      matches.push({
        matchType: 'MEETUP',
        score: Math.round(score * 100) / 100,
        distanceKm: Math.round(distanceKm * 100) / 100,
        timeDiffMinutes: Math.round(timeDiffMinutes),
        ratingDiff: Math.round(ratingDiff * 100) / 100,
        user: this.toUserSummary(candidate.creator),
        meetup: null,
        sortKey: score,
      });
    }

    return matches;
  }

  private scoreUserCandidates(
    sourceMeetup: MeetupWithCreator,
    nearbyUsers: Awaited<ReturnType<GeoLocationService['findNearby']>>,
    userMap: Map<string, UserSummaryFields>,
    ratingTolerance: number,
  ): ScoredMatch[] {
    const matches: ScoredMatch[] = [];

    for (const nearby of nearbyUsers) {
      const user = userMap.get(nearby.id);
      if (!user) {
        continue;
      }

      const ratingDiff = Math.abs(user.meetupRating - sourceMeetup.creator.meetupRating);
      if (
        sourceMeetup.creator.meetupReviewCount > 0 &&
        user.meetupReviewCount > 0 &&
        ratingDiff > ratingTolerance
      ) {
        continue;
      }

      const score =
        Math.max(0, 35 - nearby.distanceKm * 4) +
        Math.max(0, 10 - ratingDiff * 4) +
        (user.isPremium ? 5 : 0) +
        Math.min(user.rankScore * 0.05, 15);

      matches.push({
        matchType: 'USER',
        score: Math.round(score * 100) / 100,
        distanceKm: Math.round(nearby.distanceKm * 100) / 100,
        timeDiffMinutes: 0,
        ratingDiff: Math.round(ratingDiff * 100) / 100,
        user: this.toUserSummary(user),
        meetup: null,
        sortKey: score,
      });
    }

    return matches;
  }

  private toUserSummary(user: UserSummaryFields): MeetupUserSummaryDto {
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      profileImage: user.profileImage,
      meetupRating: user.meetupRating,
      meetupReviewCount: user.meetupReviewCount,
      isPremium: user.isPremium,
    };
  }
}

function meetupRadiusFallback(
  source: FoodMeetup,
  candidate: FoodMeetup,
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(candidate.latitude - source.latitude);
  const dLng = toRad(candidate.longitude - source.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(source.latitude)) *
      Math.cos(toRad(candidate.latitude)) *
      Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
