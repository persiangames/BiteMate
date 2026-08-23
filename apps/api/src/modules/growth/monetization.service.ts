import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  AffiliateCommissionDto,
  AffiliateCommissionsResponseDto,
  RestaurantAdDto,
} from '@bitemate/shared';
import type { AffiliateCommission, RestaurantAd } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { FraudLogService } from '../wallet/fraud-log.service';
import { RankingService } from './ranking.service';
import type { CreateRestaurantAdDto } from './dto/growth.dto';

@Injectable()
export class MonetizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly fraudLogService: FraudLogService,
    private readonly rankingService: RankingService,
  ) {}

  async createRestaurantAd(
    ownerId: string,
    dto: CreateRestaurantAdDto,
  ): Promise<RestaurantAdDto> {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id: dto.restaurantId, ownerId, isActive: true },
    });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found or not owned by you');
    }

    const minBudget = this.configService.get<number>('monetization.minAdBudget', 25)!;
    if (dto.budget < minBudget) {
      throw new BadRequestException(`Minimum ad budget is ${minBudget}`);
    }

    const durationDays = dto.durationDays ?? 30;
    const endsAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    const ad = await this.prisma.$transaction(async (tx) => {
      await tx.fiatWallet.upsert({
        where: { userId: ownerId },
        create: { userId: ownerId },
        update: {},
      });

      const wallet = await tx.fiatWallet.findUniqueOrThrow({ where: { userId: ownerId } });
      const available = wallet.availableBalance.toNumber();
      if (available < dto.budget) {
        throw new BadRequestException('Insufficient wallet balance for ad campaign');
      }

      await tx.fiatWallet.update({
        where: { userId: ownerId },
        data: { availableBalance: { decrement: dto.budget } },
      });

      await tx.walletTransaction.create({
        data: {
          userId: ownerId,
          type: 'WITHDRAWAL',
          status: 'COMPLETED',
          amount: dto.budget,
          fee: 0,
          netAmount: dto.budget,
          currency: 'USD',
          provider: 'INTERNAL',
          description: `Restaurant ad: ${dto.title}`,
          completedAt: new Date(),
        },
      });

      const created = await tx.restaurantAd.create({
        data: {
          restaurantId: dto.restaurantId,
          ownerId,
          title: dto.title.trim(),
          imageUrl: dto.imageUrl,
          targetUrl: dto.targetUrl,
          budget: dto.budget,
          status: 'ACTIVE',
          endsAt,
        },
        include: { restaurant: { select: { name: true } } },
      });

      await tx.restaurant.update({
        where: { id: dto.restaurantId },
        data: { isSponsored: true },
      });

      return created;
    });

    await this.rankingService.refreshRestaurantRank(dto.restaurantId);
    await this.fraudLogService.log(ownerId, 'RESTAURANT_AD_CREATED', 5, {
      details: { adId: ad.id, budget: dto.budget },
    });

    return this.toAdDto(ad, restaurant.name);
  }

  async listRestaurantAds(ownerId: string): Promise<RestaurantAdDto[]> {
    const ads = await this.prisma.restaurantAd.findMany({
      where: { ownerId },
      include: { restaurant: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return ads.map((ad) => this.toAdDto(ad, ad.restaurant.name));
  }

  async listActiveAds(limit = 10): Promise<RestaurantAdDto[]> {
    const ads = await this.prisma.restaurantAd.findMany({
      where: {
        status: 'ACTIVE',
        OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
      },
      include: { restaurant: { select: { name: true } } },
      orderBy: { startsAt: 'desc' },
      take: limit,
    });
    return ads.map((ad) => this.toAdDto(ad, ad.restaurant.name));
  }

  async recordAdImpression(adId: string): Promise<void> {
    const ad = await this.prisma.restaurantAd.findUnique({ where: { id: adId } });
    if (!ad || ad.status !== 'ACTIVE') {
      return;
    }

    const cpm = this.configService.get<number>('monetization.adCpm', 2)!;
    const impressionCost = cpm / 1000;

    await this.prisma.restaurantAd.update({
      where: { id: adId },
      data: {
        impressions: { increment: 1 },
        spent: { increment: impressionCost },
      },
    });
  }

  async recordAdClick(adId: string, referrerUserId?: string): Promise<void> {
    const ad = await this.prisma.restaurantAd.findUnique({
      where: { id: adId },
      include: { restaurant: true },
    });
    if (!ad || ad.status !== 'ACTIVE') {
      return;
    }

    const clickCost = this.configService.get<number>('monetization.adClickCost', 0.5)!;

    await this.prisma.restaurantAd.update({
      where: { id: adId },
      data: {
        clicks: { increment: 1 },
        spent: { increment: clickCost },
      },
    });

    if (referrerUserId && referrerUserId !== ad.ownerId) {
      await this.createAffiliateCommission(
        referrerUserId,
        'RESTAURANT_AD_CLICK',
        adId,
        clickCost * this.configService.get<number>('monetization.affiliateAdShare', 0.2)!,
      );
    }

    await this.rankingService.recordRestaurantVisit(ad.restaurantId, referrerUserId);
  }

  async handleBookingCompleted(
    bookingId: string,
    restaurantId: string | null,
    affiliateReferrerId: string | null,
    totalPrice: number,
  ): Promise<void> {
    if (restaurantId) {
      await this.rankingService.recordRestaurantConversion(restaurantId);
    }

    if (!affiliateReferrerId) {
      return;
    }

    const commissionRate = this.configService.get<number>(
      'monetization.affiliateBookingRate',
      0.05,
    )!;
    const amount = Math.round(totalPrice * commissionRate * 100) / 100;
    if (amount <= 0) {
      return;
    }

    await this.createAffiliateCommission(
      affiliateReferrerId,
      'BOOKING',
      bookingId,
      amount,
    );
  }

  async listAffiliateCommissions(userId: string): Promise<AffiliateCommissionsResponseDto> {
    const items = await this.prisma.affiliateCommission.findMany({
      where: { referrerUserId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const pending = items
      .filter((item) => item.status === 'PENDING' || item.status === 'APPROVED')
      .reduce((sum, item) => sum + item.amount.toNumber(), 0);
    const paid = items
      .filter((item) => item.status === 'PAID')
      .reduce((sum, item) => sum + item.amount.toNumber(), 0);

    return {
      items: items.map((item) => this.toCommissionDto(item)),
      totalPending: Math.round(pending * 100) / 100,
      totalPaid: Math.round(paid * 100) / 100,
    };
  }

  private async createAffiliateCommission(
    referrerUserId: string,
    sourceType: 'BOOKING' | 'RESTAURANT_AD_CLICK',
    sourceId: string,
    amount: number,
  ): Promise<void> {
    const existing = await this.prisma.affiliateCommission.findFirst({
      where: { sourceType, sourceId, referrerUserId },
    });
    if (existing) {
      return;
    }

    await this.prisma.affiliateCommission.create({
      data: {
        referrerUserId,
        sourceType,
        sourceId,
        amount,
        status: 'PENDING',
      },
    });

    await this.fraudLogService.log(referrerUserId, 'AFFILIATE_COMMISSION', 5, {
      details: { sourceType, sourceId, amount },
    });
  }

  private toAdDto(
    ad: RestaurantAd & { restaurant?: { name: string } },
    restaurantName: string,
  ): RestaurantAdDto {
    return {
      id: ad.id,
      restaurantId: ad.restaurantId,
      restaurantName,
      title: ad.title,
      imageUrl: ad.imageUrl,
      targetUrl: ad.targetUrl,
      budget: ad.budget.toNumber(),
      spent: ad.spent.toNumber(),
      impressions: ad.impressions,
      clicks: ad.clicks,
      status: ad.status,
      startsAt: ad.startsAt.toISOString(),
      endsAt: ad.endsAt?.toISOString() ?? null,
    };
  }

  private toCommissionDto(commission: AffiliateCommission): AffiliateCommissionDto {
    return {
      id: commission.id,
      sourceType: commission.sourceType,
      sourceId: commission.sourceId,
      amount: commission.amount.toNumber(),
      currency: commission.currency,
      status: commission.status,
      createdAt: commission.createdAt.toISOString(),
    };
  }
}
