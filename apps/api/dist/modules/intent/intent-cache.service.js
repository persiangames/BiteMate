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
exports.IntentCacheService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_service_1 = require("../redis/redis.service");
let IntentCacheService = class IntentCacheService {
    redisService;
    configService;
    constructor(redisService, configService) {
        this.redisService = redisService;
        this.configService = configService;
    }
    get geoKey() {
        return this.configService.get('intent.geoKey', 'bitemate:intents:geo');
    }
    get metaPrefix() {
        return this.configService.get('intent.metaPrefix', 'bitemate:intents:meta:');
    }
    get foodIndexPrefix() {
        return this.configService.get('intent.foodIndexPrefix', 'bitemate:intents:food:');
    }
    get matchCachePrefix() {
        return this.configService.get('intent.matchCachePrefix', 'bitemate:intents:matches:');
    }
    normalizeFoodType(foodType) {
        return foodType.trim().toLowerCase().replace(/\s+/g, '-');
    }
    metaKey(intentId) {
        return `${this.metaPrefix}${intentId}`;
    }
    foodKey(normalizedFood) {
        return `${this.foodIndexPrefix}${normalizedFood}`;
    }
    matchKey(intentId) {
        return `${this.matchCachePrefix}${intentId}`;
    }
    async cacheActiveIntent(meta, expiresAt) {
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
    async removeIntent(intentId, foodType) {
        const client = this.redisService.getClient();
        const normalizedFood = this.normalizeFoodType(foodType);
        const pipeline = client.pipeline();
        pipeline.zrem(this.geoKey, intentId);
        pipeline.del(this.metaKey(intentId));
        pipeline.del(this.matchKey(intentId));
        pipeline.srem(this.foodKey(normalizedFood), intentId);
        await pipeline.exec();
    }
    async getIntentMeta(intentId) {
        const client = this.redisService.getClient();
        const raw = await client.hgetall(this.metaKey(intentId));
        if (!raw.id) {
            return null;
        }
        return raw;
    }
    async getIntentMetaBatch(intentIds) {
        if (!intentIds.length) {
            return new Map();
        }
        const client = this.redisService.getClient();
        const pipeline = client.pipeline();
        for (const id of intentIds) {
            pipeline.hgetall(this.metaKey(id));
        }
        const results = await pipeline.exec();
        const map = new Map();
        results?.forEach((entry, index) => {
            const raw = entry?.[1];
            if (raw?.id) {
                map.set(intentIds[index], raw);
            }
        });
        return map;
    }
    async findNearbyIntentIds(params) {
        const client = this.redisService.getClient();
        const rawResults = (await client.georadius(this.geoKey, params.longitude, params.latitude, params.radiusKm, 'km', 'WITHDIST', 'ASC'));
        return rawResults.map(([intentId, distance]) => ({
            intentId,
            distanceKm: Number.parseFloat(distance),
        }));
    }
    async getFoodTypeIntentIds(normalizedFood) {
        const client = this.redisService.getClient();
        return client.smembers(this.foodKey(normalizedFood));
    }
    async setMatchCache(intentId, payload, ttlSeconds) {
        const client = this.redisService.getClient();
        await client.setex(this.matchKey(intentId), ttlSeconds, payload);
    }
    async getMatchCache(intentId) {
        const client = this.redisService.getClient();
        return client.get(this.matchKey(intentId));
    }
    async invalidateMatchCache(intentId) {
        const client = this.redisService.getClient();
        await client.del(this.matchKey(intentId));
    }
};
exports.IntentCacheService = IntentCacheService;
exports.IntentCacheService = IntentCacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        config_1.ConfigService])
], IntentCacheService);
//# sourceMappingURL=intent-cache.service.js.map