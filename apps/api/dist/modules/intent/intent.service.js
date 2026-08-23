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
exports.IntentService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../database/prisma.service");
const meetup_cache_service_1 = require("../meetups/meetup-cache.service");
const notifications_service_1 = require("../notifications/notifications.service");
const intent_cache_service_1 = require("./intent-cache.service");
const intent_matching_service_1 = require("./intent-matching.service");
const dining_1 = require("../../common/dining");
let IntentService = class IntentService {
    prisma;
    intentCache;
    meetupCache;
    matchingService;
    notificationsService;
    configService;
    constructor(prisma, intentCache, meetupCache, matchingService, notificationsService, configService) {
        this.prisma = prisma;
        this.intentCache = intentCache;
        this.meetupCache = meetupCache;
        this.matchingService = matchingService;
        this.notificationsService = notificationsService;
        this.configService = configService;
    }
    async createIntent(userId, dto) {
        await this.assertCanCreateIntent(userId);
        const timeStart = new Date(dto.timeStart);
        const timeEnd = dto.timeEnd
            ? new Date(dto.timeEnd)
            : new Date(timeStart.getTime() + 2 * 60 * 60 * 1000);
        if (Number.isNaN(timeStart.getTime()) || Number.isNaN(timeEnd.getTime())) {
            throw new common_1.BadRequestException('Invalid time window');
        }
        if (timeStart <= new Date()) {
            throw new common_1.BadRequestException('timeStart must be in the future');
        }
        if (timeEnd <= timeStart) {
            throw new common_1.BadRequestException('timeEnd must be after timeStart');
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
                    mealSlot: dto.mealSlot ?? (0, dining_1.mealFromCategory)(dto.foodCategory),
                    foodName: dto.foodName?.trim() ?? dto.foodType.trim(),
                    preferredGender: dto.preferredGender,
                    ageMin: dto.ageMin,
                    ageMax: dto.ageMax,
                    preferredEducation: dto.preferredEducation,
                    country: dto.country?.trim(),
                    city: dto.city?.trim(),
                    locationLabel: dto.locationLabel?.trim(),
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
            this.intentCache.cacheActiveIntent({
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
            }, expiresAt),
            this.meetupCache.cacheActiveMeetup({
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
            }, expiresAt),
        ]);
        const matches = await this.matchingService.findMatches(result.intent);
        const ttl = this.configService.get('intent.matchCacheTtlSeconds', 120);
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
    async getMatches(userId, intentId) {
        const intent = await this.getIntentForUser(userId, intentId);
        const ttl = this.configService.get('intent.matchCacheTtlSeconds', 120);
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
    async cancelIntent(userId, intentId) {
        const intent = await this.getIntentForUser(userId, intentId);
        if (intent.status !== 'ACTIVE') {
            throw new common_1.BadRequestException('Only active intents can be cancelled');
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
    async listMyIntents(userId) {
        const items = await this.prisma.foodIntent.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        return { items: items.map((item) => this.toIntentDto(item)) };
    }
    async getDailyLimit(userId) {
        const dailyLimit = this.configService.get('intent.dailyCreateLimit', 5);
        const maxActive = this.configService.get('intent.maxConcurrentActive', 3);
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
    async assertCanCreateIntent(userId) {
        const limits = await this.getDailyLimit(userId);
        if (limits.usedToday >= limits.dailyLimit) {
            throw new common_1.ForbiddenException('Daily food intent limit reached');
        }
        if (limits.activeCount >= limits.maxActive) {
            throw new common_1.ForbiddenException('Too many active food intents');
        }
    }
    async getIntentForUser(userId, intentId) {
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
            throw new common_1.NotFoundException('Food intent not found');
        }
        if (intent.userId !== userId) {
            throw new common_1.ForbiddenException('Not your food intent');
        }
        if (intent.status !== 'ACTIVE') {
            throw new common_1.BadRequestException('Intent is not active');
        }
        return intent;
    }
    async getUserCancelCount(userId) {
        const [intentCount, meetupCount] = await Promise.all([
            this.prisma.foodIntent.count({ where: { userId, status: 'CANCELLED' } }),
            this.prisma.foodMeetup.count({ where: { creatorId: userId, status: 'CANCELLED' } }),
        ]);
        return intentCount + meetupCount;
    }
    toIntentDto(intent) {
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
};
exports.IntentService = IntentService;
exports.IntentService = IntentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        intent_cache_service_1.IntentCacheService,
        meetup_cache_service_1.MeetupCacheService,
        intent_matching_service_1.IntentMatchingService,
        notifications_service_1.NotificationsService,
        config_1.ConfigService])
], IntentService);
function startOfUtcDay(date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
//# sourceMappingURL=intent.service.js.map