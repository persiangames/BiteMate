import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import type {
  MeetupReviewDto,
  UserBadgeDto,
  UserBadgesResponseDto,
  UserBadgeType,
  UserLevelDto,
} from '@bitemate/shared';
import { USER_BADGE_LABELS } from '@bitemate/shared';
import type { UserBadgeType as PrismaBadgeType } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { RankingCacheService } from './ranking-cache.service';
import { RankingService } from './ranking.service';
import { RedisService } from '../redis/redis.service';
import { FraudDetectionService } from '../security/fraud-detection.service';

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2000, 2800, 3800, 5000, 6500];
const MIN_ACCOUNT_AGE_DAYS = 7;
const MIN_DISTINCT_REVIEWERS = 3;

@Injectable()
export class GamificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rankingService: RankingService,
    private readonly rankingCache: RankingCacheService,
    private readonly redisService: RedisService,
    private readonly fraudDetection: FraudDetectionService,
  ) {}

  async getUserLevel(userId: string): Promise<UserLevelDto> {
    await this.syncUserProgress(userId);
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        level: true,
        experiencePoints: true,
        successfulMeetups: true,
        meetupReviewCount: true,
        activityPoints: true,
      },
    });

    const postCount = await this.prisma.post.count({ where: { authorId: userId } });
    const breakdown = {
      meetups: user.successfulMeetups * 100,
      posts: postCount * 15,
      reviews: user.meetupReviewCount * 40,
      activity: Math.min(user.activityPoints, 500) * 2,
    };

    const nextLevelXp = this.xpForLevel(user.level + 1);
    const currentLevelXp = this.xpForLevel(user.level);
    const span = Math.max(1, nextLevelXp - currentLevelXp);
    const progressPercent = Math.round(
      Math.min(100, ((user.experiencePoints - currentLevelXp) / span) * 100),
    );

    return {
      level: user.level,
      experiencePoints: user.experiencePoints,
      nextLevelXp,
      progressPercent,
      breakdown,
    };
  }

  async getUserBadges(userId: string): Promise<UserBadgesResponseDto> {
    await this.syncUserProgress(userId);
    const badges = await this.prisma.userBadge.findMany({
      where: { userId },
      orderBy: { earnedAt: 'asc' },
    });

    return {
      items: badges.map((entry) => this.toBadgeDto(entry.badge, entry.earnedAt)),
    };
  }

  async recordMeetupParticipation(
    userId: string,
    meetupId: string,
    role: 'CREATOR' | 'INVITEE',
  ): Promise<void> {
    const created = await this.prisma.meetupParticipation.createMany({
      data: [{ meetupId, userId, role }],
      skipDuplicates: true,
    });

    if (created.count === 0) {
      return;
    }

    const allowed = await this.rankingCache.consumeActivityBudget(userId, 100);
    if (allowed > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          successfulMeetups: { increment: 1 },
          activityPoints: { increment: Math.min(100, allowed) },
        },
      });
    }

    await this.syncUserProgress(userId);
    await this.rankingService.refreshUserRank(userId);
  }

  async recordPostActivity(userId: string): Promise<void> {
    await this.rankingService.recordActivity(userId, 15);
    await this.syncUserProgress(userId);
  }

  async submitMeetupReview(
    reviewerId: string,
    meetupId: string,
    reviewedUserId: string,
    rating: number,
    comment?: string,
  ): Promise<MeetupReviewDto> {
    if (reviewerId === reviewedUserId) {
      throw new BadRequestException('Cannot review yourself');
    }
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const reviewer = await this.prisma.user.findUniqueOrThrow({
      where: { id: reviewerId },
      select: { createdAt: true },
    });
    if (this.accountAgeDays(reviewer.createdAt) < MIN_ACCOUNT_AGE_DAYS) {
      throw new ForbiddenException('Account must be at least 7 days old to leave meetup reviews');
    }

    const reviewDailyKey = `bitemate:gamification:review-daily:${reviewerId}:${new Date().toISOString().slice(0, 10)}`;
    const client = this.redisService.getClient();
    const dailyCount = await client.incr(reviewDailyKey);
    if (dailyCount === 1) {
      await client.expire(reviewDailyKey, 86_400);
    }
    if (dailyCount > 5) {
      throw new ForbiddenException('Daily meetup review limit reached');
    }

    const participation = await this.prisma.meetupParticipation.findUnique({
      where: { meetupId_userId: { meetupId, userId: reviewerId } },
    });
    if (!participation) {
      throw new ForbiddenException('You must participate in the meetup to review');
    }

    const reviewedParticipation = await this.prisma.meetupParticipation.findUnique({
      where: { meetupId_userId: { meetupId, userId: reviewedUserId } },
    });
    if (!reviewedParticipation) {
      throw new BadRequestException('Reviewed user did not participate in this meetup');
    }

    await this.fraudDetection.assertReviewAllowed(reviewerId, reviewedUserId, rating);

    const review = await this.prisma.meetupReview.create({
      data: {
        meetupId,
        reviewerId,
        reviewedId: reviewedUserId,
        rating,
        comment: comment?.trim(),
      },
    });

    await this.recalculateMeetupRating(reviewedUserId);
    await this.syncUserProgress(reviewedUserId);
    await this.rankingService.refreshUserRank(reviewedUserId);

    return {
      id: review.id,
      meetupId: review.meetupId,
      reviewerId: review.reviewerId,
      reviewedUserId: review.reviewedId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
    };
  }

  async syncUserProgress(userId: string): Promise<void> {
    const [user, postCount, hostMeetups, distinctReviewers] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          createdAt: true,
          successfulMeetups: true,
          meetupReviewCount: true,
          activityPoints: true,
        },
      }),
      this.prisma.post.count({ where: { authorId: userId } }),
      this.prisma.meetupParticipation.count({
        where: { userId, role: 'CREATOR' },
      }),
      this.prisma.meetupReview.groupBy({
        by: ['reviewerId'],
        where: { reviewedId: userId },
      }),
    ]);

    const experiencePoints =
      user.successfulMeetups * 100 +
      postCount * 15 +
      user.meetupReviewCount * 40 +
      Math.min(user.activityPoints, 500) * 2;

    const level = this.levelFromXp(experiencePoints);

    await this.prisma.user.update({
      where: { id: userId },
      data: { experiencePoints, level },
    });

    const accountAgeDays = this.accountAgeDays(user.createdAt);
    const badgeChecks: Array<{ badge: UserBadgeType; eligible: boolean }> = [
      {
        badge: 'FOOD_EXPLORER',
        eligible: user.successfulMeetups >= 3 && accountAgeDays >= MIN_ACCOUNT_AGE_DAYS,
      },
      {
        badge: 'SOCIAL_EATER',
        eligible: postCount >= 10 && user.activityPoints >= 50,
      },
      {
        badge: 'TOP_REVIEWER',
        eligible:
          user.meetupReviewCount >= 5 &&
          distinctReviewers.length >= MIN_DISTINCT_REVIEWERS &&
          (await this.getMeetupRating(userId)) >= 4,
      },
      {
        badge: 'TRUSTED_HOST',
        eligible: hostMeetups >= 3 && user.successfulMeetups >= 5 && accountAgeDays >= MIN_ACCOUNT_AGE_DAYS,
      },
    ];

    for (const check of badgeChecks) {
      if (check.eligible) {
        await this.awardBadge(userId, check.badge);
      }
    }
  }

  private async awardBadge(userId: string, badge: UserBadgeType): Promise<void> {
    await this.prisma.userBadge.createMany({
      data: [{ userId, badge: badge as PrismaBadgeType }],
      skipDuplicates: true,
    });
  }

  private async recalculateMeetupRating(userId: string): Promise<void> {
    const reviews = await this.prisma.meetupReview.findMany({
      where: { reviewedId: userId },
      select: { rating: true },
    });

    if (!reviews.length) {
      return;
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = total / reviews.length;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        meetupRating: Math.round(average * 100) / 100,
        meetupReviewCount: reviews.length,
      },
    });
  }

  private async getMeetupRating(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { meetupRating: true },
    });
    return user?.meetupRating ?? 0;
  }

  private levelFromXp(xp: number): number {
    let level = 1;
    for (let index = LEVEL_THRESHOLDS.length - 1; index >= 0; index -= 1) {
      if (xp >= LEVEL_THRESHOLDS[index]!) {
        level = index + 1;
        break;
      }
    }
    return Math.min(level, LEVEL_THRESHOLDS.length);
  }

  private xpForLevel(level: number): number {
    if (level <= 1) {
      return LEVEL_THRESHOLDS[0]!;
    }
    if (level > LEVEL_THRESHOLDS.length) {
      return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]! + (level - LEVEL_THRESHOLDS.length) * 1500;
    }
    return LEVEL_THRESHOLDS[level - 1]!;
  }

  private accountAgeDays(createdAt: Date): number {
    return Math.floor((Date.now() - createdAt.getTime()) / (24 * 60 * 60 * 1000));
  }

  private toBadgeDto(badge: PrismaBadgeType, earnedAt: Date): UserBadgeDto {
    return {
      badge,
      label: USER_BADGE_LABELS[badge],
      earnedAt: earnedAt.toISOString(),
    };
  }
}
