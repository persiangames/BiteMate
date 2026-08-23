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
exports.WalletCacheService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_service_1 = require("../redis/redis.service");
let WalletCacheService = class WalletCacheService {
    redisService;
    configService;
    constructor(redisService, configService) {
        this.redisService = redisService;
        this.configService = configService;
    }
    balanceKey(userId) {
        return `bitemate:wallet:balance:${userId}`;
    }
    txKey(userId) {
        return `bitemate:wallet:tx:${userId}`;
    }
    ttl() {
        return this.configService.get('wallet.cacheTtlSeconds', 60);
    }
    async getBalance(userId) {
        const raw = await this.redisService.getClient().get(this.balanceKey(userId));
        return raw ? JSON.parse(raw) : null;
    }
    async setBalance(userId, balance) {
        await this.redisService
            .getClient()
            .set(this.balanceKey(userId), JSON.stringify(balance), 'EX', this.ttl());
    }
    async invalidateBalance(userId) {
        await this.redisService.getClient().del(this.balanceKey(userId));
    }
    async prependTransactions(userId, items) {
        const client = this.redisService.getClient();
        const key = this.txKey(userId);
        const existing = await client.get(key);
        const merged = existing
            ? [...items, ...JSON.parse(existing)].slice(0, 20)
            : items.slice(0, 20);
        await client.set(key, JSON.stringify(merged), 'EX', this.ttl());
    }
    async invalidateTransactions(userId) {
        await this.redisService.getClient().del(this.txKey(userId));
    }
    async invalidateUser(userId) {
        await this.invalidateBalance(userId);
        await this.invalidateTransactions(userId);
    }
};
exports.WalletCacheService = WalletCacheService;
exports.WalletCacheService = WalletCacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        config_1.ConfigService])
], WalletCacheService);
//# sourceMappingURL=wallet-cache.service.js.map