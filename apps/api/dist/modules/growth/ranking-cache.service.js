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
exports.RankingCacheService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_service_1 = require("../redis/redis.service");
let RankingCacheService = class RankingCacheService {
    redisService;
    configService;
    constructor(redisService, configService) {
        this.redisService = redisService;
        this.configService = configService;
    }
    ttl() {
        return this.configService.get('ranking.cacheTtlSeconds', 120);
    }
    dailyActivityCap() {
        return this.configService.get('ranking.dailyActivityCap', 20);
    }
    async getUserRankings(cityKey) {
        const raw = await this.redisService.getClient().get(this.userKey(cityKey));
        return raw ? JSON.parse(raw) : null;
    }
    async setUserRankings(cityKey, data) {
        await this.redisService
            .getClient()
            .set(this.userKey(cityKey), JSON.stringify(data), 'EX', this.ttl());
    }
    async getRestaurantRankings(cityKey) {
        const raw = await this.redisService.getClient().get(this.restaurantKey(cityKey));
        return raw ? JSON.parse(raw) : null;
    }
    async setRestaurantRankings(cityKey, data) {
        await this.redisService
            .getClient()
            .set(this.restaurantKey(cityKey), JSON.stringify(data), 'EX', this.ttl());
    }
    async invalidateAll() {
        const client = this.redisService.getClient();
        const keys = await client.keys('bitemate:ranking:*');
        if (keys.length > 0) {
            await client.del(...keys);
        }
    }
    async consumeActivityBudget(userId, requested) {
        const client = this.redisService.getClient();
        const key = `bitemate:ranking:activity:${userId}:${this.todayKey()}`;
        const current = Number(await client.get(key)) || 0;
        const remaining = Math.max(0, this.dailyActivityCap() - current);
        const granted = Math.min(requested, remaining);
        if (granted > 0) {
            await client.incrby(key, granted);
            await client.expire(key, 86_400);
        }
        return granted;
    }
    async markRestaurantVisit(restaurantId, visitorId) {
        const client = this.redisService.getClient();
        const key = `bitemate:ranking:visit:${restaurantId}:${visitorId}:${this.todayKey()}`;
        const inserted = await client.set(key, '1', 'EX', 86_400, 'NX');
        return inserted === 'OK';
    }
    userKey(cityKey) {
        return `bitemate:ranking:users:${cityKey}`;
    }
    restaurantKey(cityKey) {
        return `bitemate:ranking:restaurants:${cityKey}`;
    }
    todayKey() {
        return new Date().toISOString().slice(0, 10);
    }
};
exports.RankingCacheService = RankingCacheService;
exports.RankingCacheService = RankingCacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        config_1.ConfigService])
], RankingCacheService);
//# sourceMappingURL=ranking-cache.service.js.map