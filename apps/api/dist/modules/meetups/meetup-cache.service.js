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
exports.MeetupCacheService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_service_1 = require("../redis/redis.service");
let MeetupCacheService = class MeetupCacheService {
    redisService;
    configService;
    constructor(redisService, configService) {
        this.redisService = redisService;
        this.configService = configService;
    }
    get geoKey() {
        return this.configService.get('meetup.geoKey', 'bitemate:meetups:geo');
    }
    get metaPrefix() {
        return this.configService.get('meetup.metaPrefix', 'bitemate:meetups:meta:');
    }
    get foodIndexPrefix() {
        return this.configService.get('meetup.foodIndexPrefix', 'bitemate:meetups:food:');
    }
    normalizeFoodType(foodType) {
        return foodType.trim().toLowerCase().replace(/\s+/g, '-');
    }
    metaKey(meetupId) {
        return `${this.metaPrefix}${meetupId}`;
    }
    foodKey(normalizedFood) {
        return `${this.foodIndexPrefix}${normalizedFood}`;
    }
    inviteCountKey(userId) {
        const day = new Date().toISOString().slice(0, 10);
        return `bitemate:meetups:invites:${userId}:${day}`;
    }
    async cacheActiveMeetup(meta, expiresAt) {
        const client = this.redisService.getClient();
        const ttlSeconds = Math.max(60, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
        const normalizedFood = this.normalizeFoodType(meta.foodType);
        const pipeline = client.pipeline();
        pipeline.geoadd(this.geoKey, Number.parseFloat(meta.longitude), Number.parseFloat(meta.latitude), meta.id);
        pipeline.hset(this.metaKey(meta.id), meta);
        pipeline.expire(this.metaKey(meta.id), ttlSeconds);
        pipeline.sadd(this.foodKey(normalizedFood), meta.id);
        pipeline.expire(this.foodKey(normalizedFood), ttlSeconds);
        await pipeline.exec();
    }
    async removeMeetup(meetupId, foodType) {
        const client = this.redisService.getClient();
        const normalizedFood = this.normalizeFoodType(foodType);
        const pipeline = client.pipeline();
        pipeline.zrem(this.geoKey, meetupId);
        pipeline.del(this.metaKey(meetupId));
        pipeline.srem(this.foodKey(normalizedFood), meetupId);
        await pipeline.exec();
    }
    async getMeetupMeta(meetupId) {
        const client = this.redisService.getClient();
        const raw = await client.hgetall(this.metaKey(meetupId));
        if (!raw.id) {
            return null;
        }
        return raw;
    }
    async findNearbyMeetupIds(params) {
        const client = this.redisService.getClient();
        const rawResults = (await client.georadius(this.geoKey, params.longitude, params.latitude, params.radiusKm, 'km', 'WITHDIST', 'ASC'));
        return rawResults.map(([meetupId, distance]) => ({
            meetupId,
            distanceKm: Number.parseFloat(distance),
        }));
    }
    async getFoodTypeMeetupIds(normalizedFood) {
        const client = this.redisService.getClient();
        return client.smembers(this.foodKey(normalizedFood));
    }
    async incrementDailyInviteCount(userId) {
        const client = this.redisService.getClient();
        const key = this.inviteCountKey(userId);
        const count = await client.incr(key);
        if (count === 1) {
            await client.expire(key, 86_400);
        }
        return count;
    }
    async getDailyInviteCount(userId) {
        const client = this.redisService.getClient();
        const value = await client.get(this.inviteCountKey(userId));
        return value ? Number.parseInt(value, 10) : 0;
    }
};
exports.MeetupCacheService = MeetupCacheService;
exports.MeetupCacheService = MeetupCacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        config_1.ConfigService])
], MeetupCacheService);
//# sourceMappingURL=meetup-cache.service.js.map