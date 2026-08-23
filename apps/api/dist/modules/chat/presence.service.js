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
exports.PresenceService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_service_1 = require("../redis/redis.service");
let PresenceService = class PresenceService {
    redisService;
    configService;
    constructor(redisService, configService) {
        this.redisService = redisService;
        this.configService = configService;
    }
    key(userId) {
        const prefix = this.configService.get('chat.presencePrefix', 'bitemate:presence:');
        return `${prefix}${userId}`;
    }
    async connect(userId) {
        const client = this.redisService.getClient();
        const now = new Date().toISOString();
        const connections = await client.hincrby(this.key(userId), 'connections', 1);
        await client.hset(this.key(userId), {
            isOnline: '1',
            lastSeen: now,
            connections: connections.toString(),
        });
        return { userId, isOnline: true, lastSeen: now };
    }
    async disconnect(userId) {
        const client = this.redisService.getClient();
        const now = new Date().toISOString();
        const connections = await client.hincrby(this.key(userId), 'connections', -1);
        const nextConnections = Math.max(0, connections);
        if (nextConnections <= 0) {
            await client.hset(this.key(userId), {
                isOnline: '0',
                lastSeen: now,
                connections: '0',
            });
            return { userId, isOnline: false, lastSeen: now };
        }
        await client.hset(this.key(userId), 'connections', nextConnections.toString());
        return { userId, isOnline: true, lastSeen: now };
    }
    async getPresence(userId) {
        const client = this.redisService.getClient();
        const record = (await client.hgetall(this.key(userId)));
        if (!record.isOnline) {
            return { userId, isOnline: false, lastSeen: null };
        }
        return {
            userId,
            isOnline: record.isOnline === '1',
            lastSeen: record.lastSeen ?? null,
        };
    }
    async getPresenceBatch(userIds) {
        const results = new Map();
        await Promise.all(userIds.map(async (userId) => {
            results.set(userId, await this.getPresence(userId));
        }));
        return results;
    }
};
exports.PresenceService = PresenceService;
exports.PresenceService = PresenceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        config_1.ConfigService])
], PresenceService);
//# sourceMappingURL=presence.service.js.map