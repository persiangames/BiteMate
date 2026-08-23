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
exports.MeetupMatchingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../database/prisma.service");
const geo_location_service_1 = require("../location/geo-location.service");
const meetup_cache_service_1 = require("./meetup-cache.service");
let MeetupMatchingService = class MeetupMatchingService {
    prisma;
    meetupCache;
    geoLocationService;
    configService;
    constructor(prisma, meetupCache, geoLocationService, configService) {
        this.prisma = prisma;
        this.meetupCache = meetupCache;
        this.geoLocationService = geoLocationService;
        this.configService = configService;
    }
    async findMatches(meetup, requesterId) {
        const timeWindowMs = this.configService.get('meetup.timeMatchWindowHours', 2) *
            60 *
            60 *
            1000;
        const ratingTolerance = this.configService.get('meetup.ratingMatchTolerance', 1.5);
        const maxResults = this.configService.get('meetup.maxMatchResults', 30);
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
        const meetupMatches = await this.scoreMeetupCandidates(meetup, candidateMeetupIds, nearbyMeetups, timeWindowMs, ratingTolerance, excludedUserIds);
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
        const userMatches = this.scoreUserCandidates(meetup, nearbyUsers, userMap, ratingTolerance);
        const merged = new Map();
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
    async getExcludedUserIds(meetupId, requesterId) {
        const invites = await this.prisma.meetupInvite.findMany({
            where: { meetupId },
            select: { inviteeId: true, inviterId: true },
        });
        const excluded = new Set([requesterId]);
        for (const invite of invites) {
            excluded.add(invite.inviteeId);
            excluded.add(invite.inviterId);
        }
        return excluded;
    }
    async scoreMeetupCandidates(sourceMeetup, candidateIds, nearbyDistances, timeWindowMs, ratingTolerance, excludedUserIds) {
        if (!candidateIds.length) {
            return [];
        }
        const distanceMap = new Map(nearbyDistances.map((item) => [item.meetupId, item.distanceKm]));
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
        const matches = [];
        for (const candidate of candidates) {
            if (excludedUserIds.has(candidate.creatorId)) {
                continue;
            }
            const ratingDiff = Math.abs(candidate.creator.meetupRating - sourceMeetup.creator.meetupRating);
            if (sourceMeetup.creator.meetupReviewCount > 0 &&
                candidate.creator.meetupReviewCount > 0 &&
                ratingDiff > ratingTolerance) {
                continue;
            }
            const distanceKm = distanceMap.get(candidate.id) ?? meetupRadiusFallback(sourceMeetup, candidate);
            if (distanceKm > Math.max(sourceMeetup.radiusKm, candidate.radiusKm)) {
                continue;
            }
            const timeDiffMinutes = Math.abs(candidate.scheduledAt.getTime() - sourceMeetup.scheduledAt.getTime()) /
                60_000;
            const foodExact = this.meetupCache.normalizeFoodType(candidate.foodType) ===
                this.meetupCache.normalizeFoodType(sourceMeetup.foodType)
                ? 1
                : 0;
            const score = foodExact * 40 +
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
    scoreUserCandidates(sourceMeetup, nearbyUsers, userMap, ratingTolerance) {
        const matches = [];
        for (const nearby of nearbyUsers) {
            const user = userMap.get(nearby.id);
            if (!user) {
                continue;
            }
            const ratingDiff = Math.abs(user.meetupRating - sourceMeetup.creator.meetupRating);
            if (sourceMeetup.creator.meetupReviewCount > 0 &&
                user.meetupReviewCount > 0 &&
                ratingDiff > ratingTolerance) {
                continue;
            }
            const score = Math.max(0, 35 - nearby.distanceKm * 4) +
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
    toUserSummary(user) {
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
};
exports.MeetupMatchingService = MeetupMatchingService;
exports.MeetupMatchingService = MeetupMatchingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        meetup_cache_service_1.MeetupCacheService,
        geo_location_service_1.GeoLocationService,
        config_1.ConfigService])
], MeetupMatchingService);
function meetupRadiusFallback(source, candidate) {
    const toRad = (value) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRad(candidate.latitude - source.latitude);
    const dLng = toRad(candidate.longitude - source.longitude);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(source.latitude)) *
            Math.cos(toRad(candidate.latitude)) *
            Math.sin(dLng / 2) ** 2;
    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
//# sourceMappingURL=meetup-matching.service.js.map