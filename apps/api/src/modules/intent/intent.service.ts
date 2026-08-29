import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  FoodIntentDto,
  FoodIntentListResponseDto,
  IntentDailyLimitDto,
  IntentMatchesResponseDto,
} from '@bitemate/shared';
import type { FoodIntent, User } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { MeetupCacheService } from '../meetups/meetup-cache.service';
import { NotificationsService } from '../notifications/notifications.service';
import { IntentCacheService } from './intent-cache.service';
import { IntentMatchingService } from './intent-matching.service';
import { mealFromCategory } from '../../common/dining';
import type { CreateIntentDto } from './dto/intent.dto';

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

@Injectable()
export class IntentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly intentCache: IntentCacheService,
    private readonly meetupCache: MeetupCacheService,
    private readonly matchingService: IntentMatchingService,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  async createIntent(userId: string, dto: CreateIntentDto): Promise<FoodIntentDto> {
    await this.assertCanCreateIntent(userId);

    const timeStart = new Date(dto.timeStart);
    const timeEnd = dto.timeEnd
      ? new Date(dto.timeEnd)
      : new Date(timeStart.getTime() + 2 * 60 * 60 * 1000);

    if (Number.isNaN(timeStart.getTime()) || Number.isNaN(timeEnd.getTime())) {
      throw new BadRequestException('Invalid time window');
    }
    if (timeStart <= new Date()) {
      throw new BadRequestException('timeStart must be in the future');
    }
    if (timeEnd <= timeStart) {
      throw new BadRequestException('timeEnd must be after timeStart');
    }

    const expiresAt = new Date(timeEnd.getTime() + 60 * 60 * 1000);
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
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
    });

    const cancelCount = await this.getUserCancelCount(userId);

    const result = await this.prisma.$transaction(async (tx) => {
      const meetup = await tx.foodMeetup.create({
        data: {
          creatorId: userId,
          foodType: dto.foodType.trim(),
          foodCategory: dto.foodCategory?.trim(),
          scheduledAt: timeStart,
          radiusKm: dto.radiusKm,
          desiredPeople: dto.desiredPeople,
          latitude: dto.latitude,
          longitude: dto.longitude,
          mealSlot: dto.mealSlot ?? mealFromCategory(dto.foodCategory),
          foodName: dto.foodName?.trim() ?? dto.foodType.trim(),
          preferredGender: dto.preferredGender,
          ageMin: dto.ageMin,
          ageMax: dto.ageMax,
          preferredEducation: dto.preferredEducation,
          country: dto.country?.trim(),
          city: dto.city?.trim(),
          locationLabel: dto.locationLabel?.trim(),
          notes: dto.notes?.trim(),
          expiresAt,
        },
      });

      const intent = await tx.foodIntent.create({
        data: {
          userId,
          meetupId: meetup.id,
          foodType: dto.foodType.trim(),
          foodCategory: dto.foodCategory?.trim(),
          timeStart,
          timeEnd,
          latitude: dto.latitude,
          longitude: dto.longitude,
          radiusKm: dto.radiusKm,
          desiredPeople: dto.desiredPeople,
          budgetMin: dto.budgetMin,
          budgetMax: dto.budgetMax,
          expiresAt,
        },
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

      return { intent, meetup };
    });

    await Promise.all([
      this.intentCache.cacheActiveIntent(
        {
          id: result.intent.id,
          userId,
          foodType: result.intent.foodType,
          foodCategory: result.intent.foodCategory ?? '',
          timeStart: result.intent.timeStart.toISOString(),
          timeEnd: result.intent.timeEnd.toISOString(),
          radiusKm: result.intent.radiusKm.toString(),
          desiredPeople: result.intent.desiredPeople.toString(),
          latitude: result.intent.latitude.toString(),
          longitude: result.intent.longitude.toString(),
          budgetMin: result.intent.budgetMin?.toString() ?? '',
          budgetMax: result.intent.budgetMax?.toString() ?? '',
          status: result.intent.status,
          userRating: user.meetupRating.toString(),
          userReviewCount: user.meetupReviewCount.toString(),
          userSuccessfulMeetups: user.successfulMeetups.toString(),
          userCancelCount: cancelCount.toString(),
          userRankScore: user.rankScore.toString(),
          userRole: user.role ?? '',
          isPremium: user.isPremium.toString(),
        },
        expiresAt,
      ),
      this.meetupCache.cacheActiveMeetup(
        {
          id: result.meetup.id,
          creatorId: userId,
          foodType: result.meetup.foodType,
          foodCategory: result.meetup.foodCategory ?? '',
          scheduledAt: result.meetup.scheduledAt.toISOString(),
          radiusKm: result.meetup.radiusKm.toString(),
          desiredPeople: result.meetup.desiredPeople.toString(),
          latitude: result.meetup.latitude.toString(),
          longitude: result.meetup.longitude.toString(),
          status: result.meetup.status,
          creatorRating: user.meetupRating.toString(),
        },
        expiresAt,
      ),
    ]);

    const matches = await this.matchingService.findMatches(result.intent);
    const ttl = this.configService.get<number>('intent.matchCacheTtlSeconds', 120)!;
    await this.intentCache.setMatchCache(result.intent.id, JSON.stringify(matches), ttl);
    void this.matchingService.refreshMatchesForNearbyIntents(result.intent);

    void this.notificationsService.notify({
      userId,
      type: 'MATCH_FOUND',
      title: 'Matches found',
      body: `${matches.length} food mates match your intent for ${result.intent.foodType}`,
      entityId: result.intent.id,
      dedupeKey: `match-summary:${result.intent.id}`,
      data: { intentId: result.intent.id, matchCount: matches.length },
    });

    for (const match of matches.slice(0, 5)) {
      if (match.user.id === userId) {
        continue;
      }
      void this.notificationsService.notify({
        userId: match.user.id,
        type: 'MATCH_FOUND',
        title: 'New food match nearby',
        body: `Someone wants ${result.intent.foodType} near you`,
        entityId: result.intent.id,
        dedupeKey: `match-found:${result.intent.id}:${match.user.id}`,
        data: { intentId: result.intent.id, score: match.score },
      });
    }

    return this.toIntentDto(result.intent);
  }

  async getMatches(userId: string, intentId: string): Promise<IntentMatchesResponseDto> {
    const intent = await this.getIntentForUser(userId, intentId);
    const ttl = this.configService.get<number>('intent.matchCacheTtlSeconds', 120)!;

    const cached = await this.intentCache.getMatchCache(intentId);
    if (cached) {
      return {
        intentId,
        items: JSON.parse(cached),
        cached: true,
      };
    }

    const items = await this.matchingService.findMatches(intent);
    await this.intentCache.setMatchCache(intentId, JSON.stringify(items), ttl);

    return { intentId, items, cached: false };
  }

  async cancelIntent(userId: string, intentId: string): Promise<FoodIntentDto> {
    const intent = await this.getIntentForUser(userId, intentId);

    if (intent.status !== 'ACTIVE') {
      throw new BadRequestException('Only active intents can be cancelled');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const cancelledIntent = await tx.foodIntent.update({
        where: { id: intentId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });

      if (intent.meetupId) {
        await tx.foodMeetup.update({
          where: { id: intent.meetupId },
          data: { status: 'CANCELLED' },
        });
      }

      return cancelledIntent;
    });

    await Promise.all([
      this.intentCache.removeIntent(intent.id, intent.foodType),
      intent.meetupId
        ? this.meetupCache.removeMeetup(intent.meetupId, intent.foodType)
        : Promise.resolve(),
    ]);

    return this.toIntentDto(updated);
  }

  async listMyIntents(userId: string): Promise<FoodIntentListResponseDto> {
    const items = await this.prisma.foodIntent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return { items: items.map((item) => this.toIntentDto(item)) };
  }

  async getDailyLimit(userId: string): Promise<IntentDailyLimitDto> {
    const dailyLimit = this.configService.get<number>('intent.dailyCreateLimit', 5)!;
    const maxActive = this.configService.get<number>('intent.maxConcurrentActive', 3)!;
    const todayStart = startOfUtcDay(new Date());

    const [usedToday, activeCount] = await Promise.all([
      this.prisma.foodIntent.count({
        where: {
          userId,
          createdAt: { gte: todayStart },
          status: { in: ['ACTIVE', 'MATCHED'] },
        },
      }),
      this.prisma.foodIntent.count({
        where: {
          userId,
          status: 'ACTIVE',
          timeEnd: { gt: new Date() },
        },
      }),
    ]);

    return { usedToday, dailyLimit, activeCount, maxActive };
  }

  private async assertCanCreateIntent(userId: string): Promise<void> {
    const limits = await this.getDailyLimit(userId);
    if (limits.usedToday >= limits.dailyLimit) {
      throw new ForbiddenException('Daily food intent limit reached');
    }
    if (limits.activeCount >= limits.maxActive) {
      throw new ForbiddenException('Too many active food intents');
    }
  }

  private async getIntentForUser(userId: string, intentId: string): Promise<IntentWithUser> {
    const intent = await this.prisma.foodIntent.findUnique({
      where: { id: intentId },
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

    if (!intent) {
      throw new NotFoundException('Food intent not found');
    }
    if (intent.userId !== userId) {
      throw new ForbiddenException('Not your food intent');
    }
    if (intent.status !== 'ACTIVE') {
      throw new BadRequestException('Intent is not active');
    }

    return intent;
  }

  private async getUserCancelCount(userId: string): Promise<number> {
    const [intentCount, meetupCount] = await Promise.all([
      this.prisma.foodIntent.count({ where: { userId, status: 'CANCELLED' } }),
      this.prisma.foodMeetup.count({ where: { creatorId: userId, status: 'CANCELLED' } }),
    ]);
    return intentCount + meetupCount;
  }

  private toIntentDto(intent: FoodIntent): FoodIntentDto {
    return {
      id: intent.id,
      foodType: intent.foodType,
      foodCategory: intent.foodCategory,
      timeStart: intent.timeStart.toISOString(),
      timeEnd: intent.timeEnd.toISOString(),
      latitude: intent.latitude,
      longitude: intent.longitude,
      radiusKm: intent.radiusKm,
      desiredPeople: intent.desiredPeople,
      budgetMin: intent.budgetMin,
      budgetMax: intent.budgetMax,
      status: intent.status,
      expiresAt: intent.expiresAt.toISOString(),
      meetupId: intent.meetupId,
      createdAt: intent.createdAt.toISOString(),
    };
  }
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
