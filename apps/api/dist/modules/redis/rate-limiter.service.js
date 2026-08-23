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
exports.RateLimiterService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("./redis.service");
let RateLimiterService = class RateLimiterService {
    redisService;
    constructor(redisService) {
        this.redisService = redisService;
    }
    async consume(namespace, id, limit, windowSeconds) {
        const client = this.redisService.getClient();
        const key = `bitemate:limit:${namespace}:${id}`;
        const count = await client.incr(key);
        if (count === 1) {
            await client.expire(key, windowSeconds);
        }
        const ttl = await client.ttl(key);
        const retryAfterSeconds = ttl > 0 ? ttl : windowSeconds;
        const allowed = count <= limit;
        return {
            allowed,
            remaining: Math.max(0, limit - count),
            retryAfterSeconds,
            count,
        };
    }
    async getCount(namespace, id) {
        const raw = await this.redisService.getClient().get(`bitemate:limit:${namespace}:${id}`);
        return raw ? Number.parseInt(raw, 10) || 0 : 0;
    }
    async reset(namespace, id) {
        await this.redisService.getClient().del(`bitemate:limit:${namespace}:${id}`);
    }
};
exports.RateLimiterService = RateLimiterService;
exports.RateLimiterService = RateLimiterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], RateLimiterService);
//# sourceMappingURL=rate-limiter.service.js.map