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
exports.GeoLocationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_service_1 = require("../redis/redis.service");
let GeoLocationService = class GeoLocationService {
    redisService;
    configService;
    constructor(redisService, configService) {
        this.redisService = redisService;
        this.configService = configService;
    }
    get geoKey() {
        return this.configService.get('location.geoKey', 'bitemate:geo:live');
    }
    get ttlSeconds() {
        return this.configService.get('location.liveLocationTtlSeconds', 300);
    }
    metaKey(userId) {
        return `bitemate:geo:meta:${userId}`;
    }
    async upsertLiveLocation(userId, latitude, longitude, meta) {
        const client = this.redisService.getClient();
        const pipeline = client.pipeline();
        pipeline.geoadd(this.geoKey, longitude, latitude, userId);
        pipeline.hset(this.metaKey(userId), {
            role: meta.role,
            availability: meta.availability,
            username: meta.username,
            fullName: meta.fullName,
            profileImage: meta.profileImage,
            city: meta.city,
            country: meta.country,
        });
        pipeline.expire(this.metaKey(userId), this.ttlSeconds);
        await pipeline.exec();
    }
    async removeLiveLocation(userId) {
        const client = this.redisService.getClient();
        const pipeline = client.pipeline();
        pipeline.zrem(this.geoKey, userId);
        pipeline.del(this.metaKey(userId));
        await pipeline.exec();
    }
    async findNearby(params) {
        const client = this.redisService.getClient();
        const rawResults = (await client.georadius(this.geoKey, params.longitude, params.latitude, params.radiusKm, 'km', 'WITHDIST', 'ASC'));
        const users = [];
        for (const [userId, distance] of rawResults) {
            if (params.excludeUserId && userId === params.excludeUserId) {
                continue;
            }
            const meta = await client.hgetall(this.metaKey(userId));
            if (!meta.role) {
                continue;
            }
            if (params.role && meta.role !== params.role) {
                continue;
            }
            if (params.availability &&
                meta.availability !== params.availability) {
                continue;
            }
            const position = (await client.geopos(this.geoKey, userId))?.[0];
            if (!position) {
                continue;
            }
            const [longitude, latitude] = position;
            users.push({
                id: userId,
                username: meta.username || null,
                fullName: meta.fullName || null,
                bio: null,
                role: meta.role,
                profileImage: meta.profileImage || null,
                availabilityStatus: meta.availability,
                distanceKm: Number.parseFloat(distance),
                latitude: Number.parseFloat(latitude),
                longitude: Number.parseFloat(longitude),
                city: meta.city || null,
                country: meta.country || null,
                age: null,
                gender: null,
                education: null,
                preferredMeals: [],
                favoriteCuisines: [],
                favoriteFoods: [],
                lookingToEat: false,
                meetupRating: 0,
                meetupReviewCount: 0,
                lastLiveLocationAt: null,
                isOnline: meta.availability === 'AVAILABLE',
                compatibility: 42,
            });
        }
        return users;
    }
};
exports.GeoLocationService = GeoLocationService;
exports.GeoLocationService = GeoLocationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        config_1.ConfigService])
], GeoLocationService);
//# sourceMappingURL=geo-location.service.js.map