import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { RateLimiterService } from '../redis/rate-limiter.service';
import { FraudLogService } from '../wallet/fraud-log.service';

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'tempmail.com',
  '10minutemail.com',
  'trashmail.com',
  'yopmail.com',
]);

const AUTO_BAN_SCORE = 95;
const BLOCK_ACTION_SCORE = 75;

export interface SecurityContext {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class FraudDetectionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rateLimiter: RateLimiterService,
    private readonly fraudLogService: FraudLogService,
    private readonly configService: ConfigService,
  ) {}

  async assertRegistrationAllowed(
    email: string | undefined,
    phoneNumber: string | undefined,
    context: SecurityContext,
  ): Promise<void> {
    let score = 0;
    const ip = context.ipAddress ?? 'unknown';
    const hourlyLimit = this.configService.get<number>('security.registerIpHourlyLimit', 3)!;
    const ipLimit = await this.rateLimiter.consume('register-ip', ip, hourlyLimit, 3600);

    if (!ipLimit.allowed) {
      score += 70;
    } else if (ipLimit.count >= hourlyLimit) {
      score += 40;
    }

    const domain = email?.split('@')[1]?.toLowerCase();
    if (domain && DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
      score += 50;
    }

    const recentSamePhone = phoneNumber
      ? await this.prisma.user.count({
          where: {
            phoneNumber,
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        })
      : 0;
    if (recentSamePhone > 0) {
      score += 40;
    }

    if (score >= BLOCK_ACTION_SCORE) {
      throw new ForbiddenException('Registration temporarily blocked by fraud controls');
    }
  }

  async inspectNewAccount(userId: string, context: SecurityContext): Promise<void> {
    const ip = context.ipAddress ?? 'unknown';
    const ipLimit = await this.rateLimiter.consume('register-ip-log', ip, 1000, 3600);
    const score = ipLimit.count >= 3 ? 45 : 10;
    await this.record(userId, 'FAKE_ACCOUNT_SIGNAL', score, context, {
      registrationsFromIp: ipLimit.count,
    });
  }

  async assertMeetupCreateAllowed(userId: string, context: SecurityContext = {}): Promise<void> {
    const daily = await this.rateLimiter.consume('meetup-create', userId, 8, 86_400);
    if (!daily.allowed) {
      throw new ForbiddenException('Daily meetup create limit reached');
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { createdAt: true },
    });
    const ageHours = (Date.now() - user.createdAt.getTime()) / (60 * 60 * 1000);
    let score = 0;
    if (ageHours < 24 && daily.count >= 3) {
      score += 55;
    }
    if (daily.count >= 6) {
      score += 25;
    }

    if (score >= 40) {
      await this.record(userId, 'FAKE_MEETUP_SIGNAL', score, context, {
        createsToday: daily.count,
        ageHours: Math.round(ageHours),
      });
    }
    if (score >= BLOCK_ACTION_SCORE) {
      throw new ForbiddenException('Meetup creation blocked by fraud controls');
    }
  }

  async assertReviewAllowed(
    reviewerId: string,
    reviewedId: string,
    rating: number,
    context: SecurityContext = {},
  ): Promise<void> {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [outgoing, incoming] = await Promise.all([
      this.prisma.meetupReview.count({
        where: { reviewerId, reviewedId, createdAt: { gte: since } },
      }),
      this.prisma.meetupReview.count({
        where: { reviewerId: reviewedId, reviewedId: reviewerId, createdAt: { gte: since } },
      }),
    ]);

    let score = 0;
    if (outgoing >= 2) {
      score += 40;
    }
    if (rating === 5 && incoming >= 1) {
      score += 45;
    }
    if (rating === 5 && outgoing >= 1 && incoming >= 1) {
      score += 30;
    }

    const recentFives = await this.prisma.meetupReview.count({
      where: {
        reviewerId,
        rating: 5,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });
    if (recentFives >= 3) {
      score += 35;
    }

    if (score >= 30) {
      await this.record(reviewerId, 'RATING_MANIPULATION', Math.min(score, 100), context, {
        reviewedId,
        rating,
        outgoing,
        incoming,
        recentFives,
      });
    }

    if (score >= BLOCK_ACTION_SCORE) {
      throw new ForbiddenException('Review blocked by fraud controls');
    }
  }

  async maybeSuspend(userId: string, score: number): Promise<void> {
    if (score < AUTO_BAN_SCORE) {
      return;
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        tokenVersion: { increment: 1 },
      },
    });
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  private async record(
    userId: string,
    action: string,
    riskScore: number,
    context: SecurityContext,
    details: Record<string, unknown>,
  ): Promise<void> {
    await this.fraudLogService.log(userId, action, riskScore, {
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      details,
    });
    await this.maybeSuspend(userId, riskScore);
  }
}
