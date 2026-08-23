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
exports.RedisThrottlerStorage = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("./redis.service");
let RedisThrottlerStorage = class RedisThrottlerStorage {
    redisService;
    constructor(redisService) {
        this.redisService = redisService;
    }
    async increment(key, ttl, limit, blockDuration, throttlerName) {
        const client = this.redisService.getClient();
        const hitsKey = `bitemate:rl:${throttlerName}:${key}`;
        const blockKey = `${hitsKey}:block`;
        const blockedTtl = await client.pttl(blockKey);
        if (blockedTtl > 0) {
            return {
                totalHits: limit + 1,
                timeToExpire: Math.ceil(blockedTtl / 1000),
                isBlocked: true,
                timeToBlockExpire: Math.ceil(blockedTtl / 1000),
            };
        }
        const hits = await client.incr(hitsKey);
        if (hits === 1) {
            await client.pexpire(hitsKey, ttl);
        }
        const pttl = await client.pttl(hitsKey);
        const timeToExpire = Math.max(1, Math.ceil(pttl / 1000));
        if (hits > limit) {
            const blockMs = blockDuration > 0 ? blockDuration : ttl;
            await client.set(blockKey, '1', 'PX', blockMs);
            return {
                totalHits: hits,
                timeToExpire,
                isBlocked: true,
                timeToBlockExpire: Math.ceil(blockMs / 1000),
            };
        }
        return {
            totalHits: hits,
            timeToExpire,
            isBlocked: false,
            timeToBlockExpire: 0,
        };
    }
};
exports.RedisThrottlerStorage = RedisThrottlerStorage;
exports.RedisThrottlerStorage = RedisThrottlerStorage = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], RedisThrottlerStorage);
//# sourceMappingURL=redis-throttler.storage.js.map