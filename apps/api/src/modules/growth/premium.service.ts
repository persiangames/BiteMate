import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  PremiumStatusDto,
  PremiumSubscribeResponseDto,
} from '@bitemate/shared';
import type { User } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { FraudLogService } from '../wallet/fraud-log.service';
import type { PremiumSubscribeDto } from './dto/growth.dto';

@Injectable()
export class PremiumService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly fraudLogService: FraudLogService,
  ) {}

  async getStatus(userId: string): Promise<PremiumStatusDto> {
    await this.syncExpiredPremium(userId);

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { isPremium: true, premiumExpiresAt: true },
    });

    const activeSub = await this.prisma.premiumSubscription.findFirst({
      where: { userId, status: 'ACTIVE', expiresAt: { gt: new Date() } },
      orderBy: { expiresAt: 'desc' },
    });

    return {
      isPremium: this.isPremiumActive(user),
      expiresAt: user.premiumExpiresAt?.toISOString() ?? null,
      planId: activeSub?.planId ?? null,
      benefits: this.getBenefits(),
    };
  }

  async subscribe(
    userId: string,
    dto: PremiumSubscribeDto,
  ): Promise<PremiumSubscribeResponseDto> {
    const amount = this.configService.get<number>('premium.monthlyPrice', 9.99)!;
    const currency = 'USD';
    const durationDays = this.configService.get<number>('premium.durationDays', 30)!;

    await this.fraudLogService.log(userId, 'PREMIUM_SUBSCRIBE', 5, {
      details: { amount, paymentMethod: dto.paymentMethod ?? 'WALLET' },
    });

    const paymentMethod = dto.paymentMethod ?? 'WALLET';

    const subscription = await this.prisma.$transaction(async (tx) => {
      if (paymentMethod === 'WALLET') {
        await tx.fiatWallet.upsert({
          where: { userId },
          create: { userId },
          update: {},
        });

        const wallet = await tx.fiatWallet.findUniqueOrThrow({ where: { userId } });
        const available = wallet.availableBalance.toNumber();
        if (available < amount) {
          throw new BadRequestException('Insufficient wallet balance for premium subscription');
        }

        await tx.fiatWallet.update({
          where: { userId },
          data: { availableBalance: { decrement: amount } },
        });

        await tx.walletTransaction.create({
          data: {
            userId,
            type: 'WITHDRAWAL',
            status: 'COMPLETED',
            amount,
            fee: 0,
            netAmount: amount,
            currency,
            provider: 'INTERNAL',
            description: 'Premium monthly subscription',
            idempotencyKey: dto.idempotencyKey,
            completedAt: new Date(),
          },
        });
      }

      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { premiumExpiresAt: true },
      });

      const baseDate =
        user.premiumExpiresAt && user.premiumExpiresAt > new Date()
          ? user.premiumExpiresAt
          : new Date();
      const expiresAt = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

      await tx.user.update({
        where: { id: userId },
        data: { isPremium: true, premiumExpiresAt: expiresAt },
      });

      return tx.premiumSubscription.create({
        data: {
          userId,
          status: 'ACTIVE',
          amount,
          currency,
          expiresAt,
          providerReferenceId: dto.idempotencyKey,
        },
      });
    });

    return {
      subscriptionId: subscription.id,
      isPremium: true,
      expiresAt: subscription.expiresAt.toISOString(),
      amount,
      currency,
    };
  }

  async resolvePremium(userId: string): Promise<boolean> {
    await this.syncExpiredPremium(userId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true, premiumExpiresAt: true },
    });
    return user ? this.isPremiumActive(user) : false;
  }

  isPremiumActive(user: Pick<User, 'isPremium' | 'premiumExpiresAt'>): boolean {
    if (!user.isPremium) {
      return false;
    }
    if (!user.premiumExpiresAt) {
      return true;
    }
    return user.premiumExpiresAt > new Date();
  }

  getBenefits() {
    const premiumLimit = this.configService.get<number>(
      'meetup.premiumDailyInviteLimit',
      9999,
    )!;
    return {
      dailyInviteLimit: premiumLimit,
      unlimitedInvites: premiumLimit >= 9999,
      visibilityBoost: this.configService.get<number>('premium.visibilityBoost', 5)!,
      priorityRankingBoost: this.configService.get<number>(
        'premium.priorityRankingBoost',
        10,
      )!,
      priorityMatchingBoost: this.configService.get<number>('premium.visibilityBoost', 5)!,
      removeLimits: true,
    };
  }

  private async syncExpiredPremium(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true, premiumExpiresAt: true },
    });
    if (!user?.isPremium || !user.premiumExpiresAt) {
      return;
    }
    if (user.premiumExpiresAt <= new Date()) {
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: userId },
          data: { isPremium: false },
        }),
        this.prisma.premiumSubscription.updateMany({
          where: { userId, status: 'ACTIVE', expiresAt: { lte: new Date() } },
          data: { status: 'EXPIRED' },
        }),
      ]);
    }
  }
}
