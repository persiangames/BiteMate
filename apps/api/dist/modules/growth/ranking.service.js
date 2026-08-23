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
exports.RankingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../database/prisma.service");
const fraud_log_service_1 = require("../wallet/fraud-log.service");
const ranking_cache_service_1 = require("./ranking-cache.service");
const notifications_service_1 = require("../notifications/notifications.service");
const MIN_ACCOUNT_AGE_DAYS = 7;
const MIN_REVIEWS_FOR_FULL_WEIGHT = 3;
const FRAUD_EXCLUSION_THRESHOLD = 60;
let RankingService = class RankingService {
    prisma;
    rankingCache;
    fraudLogService;
    notificationsService;
    configService;
    constructor(prisma, rankingCache, fraudLogService, notificationsService, configService) {
        this.prisma = prisma;
        this.rankingCache = rankingCache;
        this.fraudLogService = fraudLogService;
        this.notificationsService = notificationsService;
        this.configService = configService;
    }
    async getUserRankings(query) {
        const cacheKey = query.city ?? 'global';
        const cached = await this.rankingCache.getUserRankings(cacheKey);
        if (cached) {
            return cached;
        }
        const users = await this.prisma.user.findMany({
            where: {
                isActive: true,
                otpVerified: true,
                ...(query.city ? { city: { equals: query.city, mode: 'insensitive' } } : {}),
            },
            orderBy: [{ rankScore: 'desc' }, { successfulMeetups: 'desc' }],
            take: query.limit,
            select: {
                id: true,
                username: true,
                fullName: true,
                profileImage: true,
                rankScore: true,
                meetupRating: true,
                meetupReviewCount: true,
                successfulMeetups: true,
                activityPoints: true,
                isPremium: true,
                premiumExpiresAt: true,
                createdAt: true,
            },
        });
        const eligible = [];
        for (const user of users) {
            if (await this.isEligibleForLeaderboard(user.id, user.createdAt)) {
                eligible.push(user);
            }
        }
        const response = {
            city: query.city ?? null,
            updatedAt: new Date().toISOString(),
            items: eligible.map((user, index) => ({
                rank: index + 1,
                userId: user.id,
                username: user.username,
                fullName: user.fullName,
                profileImage: user.profileImage,
                rankScore: user.rankScore,
                meetupRating: user.meetupRating,
                meetupReviewCount: user.meetupReviewCount,
                successfulMeetups: user.successfulMeetups,
                activityPoints: user.activityPoints,
                isPremium: this.isPremiumActive(user),
            })),
        };
        await this.rankingCache.setUserRankings(cacheKey, response);
        return response;
    }
    async getRestaurantRankings(query) {
        const cacheKey = query.city ?? 'global';
        const cached = await this.rankingCache.getRestaurantRankings(cacheKey);
        if (cached) {
            return cached;
        }
        const restaurants = await this.prisma.restaurant.findMany({
            where: {
                isActive: true,
                ...(query.city ? { city: { equals: query.city, mode: 'insensitive' } } : {}),
            },
            orderBy: [{ rankScore: 'desc' }, { conversionCount: 'desc' }],
            take: query.limit,
        });
        const response = {
            city: query.city ?? null,
            updatedAt: new Date().toISOString(),
            items: restaurants.map((restaurant, index) => ({
                rank: index + 1,
                restaurantId: restaurant.id,
                name: restaurant.name,
                city: restaurant.city,
                country: restaurant.country,
                profileImage: restaurant.profileImage,
                rankScore: restaurant.rankScore,
                averageRating: restaurant.averageRating,
                reviewCount: restaurant.reviewCount,
                visitCount: restaurant.visitCount,
                conversionCount: restaurant.conversionCount,
                conversionRate: this.conversionRate(restaurant),
                isSponsored: restaurant.isSponsored,
            })),
        };
        await this.rankingCache.setRestaurantRankings(cacheKey, response);
        return response;
    }
    async refreshUserRank(userId) {
        const user = await this.prisma.user.findUniqueOrThrow({
            where: { id: userId },
            select: {
                id: true,
                rankScore: true,
                createdAt: true,
                meetupRating: true,
                meetupReviewCount: true,
                activityPoints: true,
                successfulMeetups: true,
                isPremium: true,
                premiumExpiresAt: true,
            },
        });
        const successfulMeetups = await this.countSuccessfulMeetups(userId);
        const fraudPenalty = await this.computeFraudPenalty(userId);
        const score = this.computeUserScore({
            successfulMeetups,
            meetupRating: user.meetupRating,
            meetupReviewCount: user.meetupReviewCount,
            activityPoints: user.activityPoints,
            isPremium: this.isPremiumActive(user),
            accountAgeDays: this.accountAgeDays(user.createdAt),
            fraudPenalty,
        });
        await this.prisma.user.update({
            where: { id: userId },
            data: { rankScore: score, successfulMeetups },
        });
        if (Math.abs(score - user.rankScore) >= 5) {
            void this.notificationsService.notify({
                userId,
                type: 'RANKING_UPDATE',
                title: 'Ranking updated',
                body: `Your BiteMate rank score is now ${score.toFixed(1)}`,
                entityId: userId,
                dedupeKey: `ranking:${userId}:${Math.round(score)}`,
                data: { rankScore: score },
            });
        }
        await this.rankingCache.invalidateAll();
        return score;
    }
    async refreshRestaurantRank(restaurantId) {
        const restaurant = await this.prisma.restaurant.findUniqueOrThrow({
            where: { id: restaurantId },
        });
        const score = this.computeRestaurantScore(restaurant);
        await this.prisma.restaurant.update({
            where: { id: restaurantId },
            data: { rankScore: score },
        });
        await this.rankingCache.invalidateAll();
        return score;
    }
    async recordActivity(userId, points) {
        const allowed = await this.rankingCache.consumeActivityBudget(userId, points);
        if (allowed <= 0) {
            return;
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { activityPoints: { increment: allowed } },
        });
        await this.refreshUserRank(userId);
    }
    async recordRestaurantVisit(restaurantId, visitorId) {
        const restaurant = await this.prisma.restaurant.findFirst({
            where: { id: restaurantId, isActive: true },
            select: { id: true, ownerId: true },
        });
        if (!restaurant) {
            return;
        }
        if (visitorId) {
            if (visitorId === restaurant.ownerId) {
                return;
            }
            const counted = await this.rankingCache.markRestaurantVisit(restaurantId, visitorId);
            if (!counted) {
                return;
            }
        }
        await this.prisma.restaurant.update({
            where: { id: restaurantId },
            data: { visitCount: { increment: 1 } },
        });
        await this.refreshRestaurantRank(restaurantId);
    }
    async recordRestaurantConversion(restaurantId) {
        await this.prisma.restaurant.update({
            where: { id: restaurantId },
            data: { conversionCount: { increment: 1 } },
        });
        await this.refreshRestaurantRank(restaurantId);
    }
    computeUserScore(params) {
        const reviewWeight = params.meetupReviewCount >= MIN_REVIEWS_FOR_FULL_WEIGHT
            ? 1
            : params.meetupReviewCount * 0.25;
        let score = params.successfulMeetups * 15 +
            params.meetupRating * Math.min(params.meetupReviewCount, 50) * 2 * reviewWeight +
            Math.min(params.activityPoints, 500) * 0.5 +
            (params.isPremium
                ? this.configService.get('premium.priorityRankingBoost', 10)
                : 0) -
            params.fraudPenalty;
        if (params.accountAgeDays < MIN_ACCOUNT_AGE_DAYS) {
            score *= 0.5;
        }
        return Math.round(Math.max(0, score) * 100) / 100;
    }
    computeRestaurantScore(restaurant) {
        const bayesianRating = (restaurant.averageRating * restaurant.reviewCount + 3.5 * 10) /
            (restaurant.reviewCount + 10);
        const visitScore = Math.log10(restaurant.visitCount + 1) * 5;
        const conversionRate = this.conversionRate(restaurant);
        const conversionScore = conversionRate * 30;
        const reviewScore = bayesianRating * 10;
        const adBoost = restaurant.isSponsored
            ? this.configService.get('premium.restaurantAdBoost', 15)
            : 0;
        return (Math.round((reviewScore + visitScore + conversionScore + adBoost) * 100) / 100);
    }
    isPremiumActive(user) {
        if (!user.isPremium) {
            return false;
        }
        if (!user.premiumExpiresAt) {
            return true;
        }
        return user.premiumExpiresAt > new Date();
    }
    async isEligibleForLeaderboard(userId, createdAt) {
        if (this.accountAgeDays(createdAt) < MIN_ACCOUNT_AGE_DAYS) {
            return false;
        }
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const fraudAggregate = await this.prisma.fraudLog.aggregate({
            where: { userId, createdAt: { gte: since } },
            _sum: { riskScore: true },
        });
        return (fraudAggregate._sum.riskScore ?? 0) < FRAUD_EXCLUSION_THRESHOLD;
    }
    async computeFraudPenalty(userId) {
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const aggregate = await this.prisma.fraudLog.aggregate({
            where: { userId, createdAt: { gte: since } },
            _sum: { riskScore: true },
        });
        return Math.floor((aggregate._sum.riskScore ?? 0) / 10);
    }
    async countSuccessfulMeetups(userId) {
        const asCreator = await this.prisma.foodMeetup.count({
            where: { creatorId: userId, status: 'COMPLETED' },
        });
        const asParticipant = await this.prisma.meetupInvite.count({
            where: {
                inviteeId: userId,
                status: 'ACCEPTED',
                meetup: { status: 'COMPLETED' },
            },
        });
        return asCreator + asParticipant;
    }
    accountAgeDays(createdAt) {
        return Math.floor((Date.now() - createdAt.getTime()) / (24 * 60 * 60 * 1000));
    }
    conversionRate(restaurant) {
        if (restaurant.visitCount <= 0) {
            return 0;
        }
        return Math.round((restaurant.conversionCount / restaurant.visitCount) * 1000) / 1000;
    }
};
exports.RankingService = RankingService;
exports.RankingService = RankingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ranking_cache_service_1.RankingCacheService,
        fraud_log_service_1.FraudLogService,
        notifications_service_1.NotificationsService,
        config_1.ConfigService])
], RankingService);
//# sourceMappingURL=ranking.service.js.map