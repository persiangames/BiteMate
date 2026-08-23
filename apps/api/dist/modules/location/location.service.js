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
exports.LocationService = void 0;
const common_1 = require("@nestjs/common");
const dining_1 = require("../../common/dining");
const prisma_service_1 = require("../database/prisma.service");
const user_mapper_1 = require("../auth/mappers/user.mapper");
const geo_location_service_1 = require("./geo-location.service");
let LocationService = class LocationService {
    prisma;
    geoLocationService;
    constructor(prisma, geoLocationService) {
        this.prisma = prisma;
        this.geoLocationService = geoLocationService;
    }
    async updateLiveLocation(userId, dto) {
        this.validateCoordinates(dto.latitude, dto.longitude);
        const existing = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!existing) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!existing.liveLocationEnabled) {
            throw new common_1.BadRequestException('Live location sharing is disabled');
        }
        if (existing.invisibleMode) {
            throw new common_1.BadRequestException('Live location cannot be updated in invisible mode');
        }
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                liveLatitude: dto.latitude,
                liveLongitude: dto.longitude,
                lastLiveLocationAt: new Date(),
                availabilityStatus: existing.availabilityStatus === 'OFFLINE'
                    ? 'AVAILABLE'
                    : existing.availabilityStatus,
            },
        });
        await this.syncRedisIndex(user);
        return (0, user_mapper_1.mapUserToAuthDto)(user);
    }
    async findNearbyUsers(requesterId, query) {
        this.validateCoordinates(query.latitude, query.longitude);
        const users = await this.findNearbyFromDatabase(requesterId, query);
        return {
            radiusKm: query.radiusKm,
            count: users.length,
            users,
        };
    }
    async findNearbyFromDatabase(requesterId, query) {
        const latDelta = query.radiusKm / 111;
        const cosLat = Math.cos((query.latitude * Math.PI) / 180);
        const lngDelta = query.radiusKm / (111 * Math.max(0.2, Math.abs(cosLat)));
        const viewer = await this.prisma.user.findUnique({
            where: { id: requesterId },
            select: {
                preferredMeals: true,
                favoriteCuisines: true,
                favoriteFoods: true,
                city: true,
                country: true,
            },
        });
        const candidates = await this.prisma.user.findMany({
            where: {
                id: { not: requesterId },
                isActive: true,
                invisibleMode: false,
                liveLatitude: {
                    gte: query.latitude - latDelta,
                    lte: query.latitude + latDelta,
                },
                liveLongitude: {
                    gte: query.longitude - lngDelta,
                    lte: query.longitude + lngDelta,
                },
                ...(query.role ? { role: query.role } : {}),
                ...(query.availability ? { availabilityStatus: query.availability } : {}),
                ...(query.gender ? { gender: query.gender } : {}),
                ...(query.education ? { education: query.education } : {}),
                ...(query.country
                    ? { country: { equals: query.country, mode: 'insensitive' } }
                    : {}),
                ...(query.city ? { city: { equals: query.city, mode: 'insensitive' } } : {}),
                ...(query.lookingToEat ? { lookingToEat: true } : {}),
                ...(query.mealSlot ? { preferredMeals: { has: query.mealSlot } } : {}),
            },
            take: 800,
        });
        return candidates
            .map((user) => {
            const distanceKm = haversineKm(query.latitude, query.longitude, user.liveLatitude, user.liveLongitude);
            const age = (0, dining_1.ageFromDateOfBirth)(user.dateOfBirth);
            return {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                bio: user.bio,
                role: user.role,
                profileImage: user.profileImage,
                availabilityStatus: user.availabilityStatus,
                distanceKm: Math.round(distanceKm * 100) / 100,
                latitude: user.liveLatitude,
                longitude: user.liveLongitude,
                city: user.city,
                country: user.country,
                age,
                gender: user.gender,
                education: user.education,
                preferredMeals: user.preferredMeals,
                favoriteCuisines: user.favoriteCuisines ?? [],
                favoriteFoods: user.favoriteFoods ?? [],
                lookingToEat: user.lookingToEat,
                meetupRating: user.meetupRating,
                meetupReviewCount: user.meetupReviewCount,
                lastLiveLocationAt: user.lastLiveLocationAt
                    ? user.lastLiveLocationAt.toISOString()
                    : null,
                isOnline: user.availabilityStatus === 'AVAILABLE' || (0, dining_1.isRecentlyOnline)(user.lastLiveLocationAt),
                compatibility: (0, dining_1.diningCompatibility)(viewer, user),
            };
        })
            .filter((user) => {
            if (user.distanceKm > query.radiusKm)
                return false;
            if (query.ageMin != null && (user.age == null || user.age < query.ageMin))
                return false;
            if (query.ageMax != null && (user.age == null || user.age > query.ageMax))
                return false;
            if (!(0, dining_1.tagsMatch)(user.favoriteCuisines, query.foodType))
                return false;
            if (!(0, dining_1.tagsMatch)(user.favoriteFoods, query.foodName))
                return false;
            return true;
        })
            .sort((a, b) => {
            if (a.lookingToEat !== b.lookingToEat) {
                return a.lookingToEat ? -1 : 1;
            }
            if (b.compatibility !== a.compatibility) {
                return b.compatibility - a.compatibility;
            }
            return a.distanceKm - b.distanceKm;
        })
            .slice(0, 80);
    }
    async syncRedisIndex(user) {
        const shouldIndex = user.otpVerified &&
            user.liveLocationEnabled &&
            !user.invisibleMode &&
            user.liveLatitude !== null &&
            user.liveLongitude !== null &&
            user.role !== null;
        if (!shouldIndex) {
            await this.geoLocationService.removeLiveLocation(user.id);
            return;
        }
        await this.geoLocationService.upsertLiveLocation(user.id, user.liveLatitude, user.liveLongitude, {
            role: user.role,
            availability: user.availabilityStatus,
            username: user.username ?? '',
            fullName: user.fullName ?? '',
            profileImage: user.profileImage ?? '',
            city: user.city ?? '',
            country: user.country ?? '',
        });
    }
    validateCoordinates(latitude, longitude) {
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            throw new common_1.BadRequestException('Invalid coordinates');
        }
    }
};
exports.LocationService = LocationService;
exports.LocationService = LocationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        geo_location_service_1.GeoLocationService])
], LocationService);
function haversineKm(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
//# sourceMappingURL=location.service.js.map