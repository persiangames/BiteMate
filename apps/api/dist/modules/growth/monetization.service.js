"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonetizationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../database/prisma.service");
const fraud_log_service_1 = require("../wallet/fraud-log.service");
const ranking_service_1 = require("./ranking.service");
let MonetizationService = class MonetizationService {
    prisma;
    configService;
    fraudLogService;
    rankingService;
    constructor(prisma, configService, fraudLogService, rankingService) {
        this.prisma = prisma;
        this.configService = configService;
        this.fraudLogService = fraudLogService;
        this.rankingService = rankingService;
    }
    async createRestaurantAd(ownerId, dto) {
        const restaurant = await this.prisma.restaurant.findFirst({
            where: { id: dto.restaurantId, ownerId, isActive: true },
        });
        if (!restaurant) {
            throw new common_1.NotFoundException('Restaurant not found or not owned by you');
        }
        const minBudget = this.configService.get('monetization.minAdBudget', 25);
        if (dto.budget < minBudget) {
            throw new common_1.BadRequestException(`Minimum ad budget is ${minBudget}`);
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
                throw new common_1.BadRequestException('Insufficient wallet balance for ad campaign');
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
    async listRestaurantAds(ownerId) {
        const ads = await this.prisma.restaurantAd.findMany({
            where: { ownerId },
            include: { restaurant: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        return ads.map((ad) => this.toAdDto(ad, ad.restaurant.name));
    }
    async listActiveAds(limit = 10) {
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
    async recordAdImpression(adId) {
        const ad = await this.prisma.restaurantAd.findUnique({ where: { id: adId } });
        if (!ad || ad.status !== 'ACTIVE') {
            return;
        }
        const cpm = this.configService.get('monetization.adCpm', 2);
        const impressionCost = cpm / 1000;
        await this.prisma.restaurantAd.update({
            where: { id: adId },
            data: {
                impressions: { increment: 1 },
                spent: { increment: impressionCost },
            },
        });
    }
    async recordAdClick(adId, referrerUserId) {
        const ad = await this.prisma.restaurantAd.findUnique({
            where: { id: adId },
            include: { restaurant: true },
        });
        if (!ad || ad.status !== 'ACTIVE') {
            return;
        }
        const clickCost = this.configService.get('monetization.adClickCost', 0.5);
        await this.prisma.restaurantAd.update({
            where: { id: adId },
            data: {
                clicks: { increment: 1 },
                spent: { increment: clickCost },
            },
        });
        if (referrerUserId && referrerUserId !== ad.ownerId) {
            await this.createAffiliateCommission(referrerUserId, 'RESTAURANT_AD_CLICK', adId, clickCost * this.configService.get('monetization.affiliateAdShare', 0.2));
        }
        await this.rankingService.recordRestaurantVisit(ad.restaurantId, referrerUserId);
    }
    async handleBookingCompleted(bookingId, restaurantId, affiliateReferrerId, totalPrice) {
        if (restaurantId) {
            await this.rankingService.recordRestaurantConversion(restaurantId);
        }
        if (!affiliateReferrerId) {
            return;
        }
        const commissionRate = this.configService.get('monetization.affiliateBookingRate', 0.05);
        const amount = Math.round(totalPrice * commissionRate * 100) / 100;
        if (amount <= 0) {
            return;
        }
        await this.createAffiliateCommission(affiliateReferrerId, 'BOOKING', bookingId, amount);
    }
    async listAffiliateCommissions(userId) {
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
    async createAffiliateCommission(referrerUserId, sourceType, sourceId, amount) {
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
    toAdDto(ad, restaurantName) {
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
    toCommissionDto(commission) {
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
};
exports.MonetizationService = MonetizationService;
exports.MonetizationService = MonetizationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        fraud_log_service_1.FraudLogService,
        ranking_service_1.RankingService])
], MonetizationService);
//# sourceMappingURL=monetization.service.js.map