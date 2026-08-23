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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
const memory_redis_1 = require("./memory-redis");
let RedisService = RedisService_1 = class RedisService {
    configService;
    logger = new common_1.Logger(RedisService_1.name);
    client = new memory_redis_1.MemoryRedis();
    fallback = true;
    constructor(configService) {
        this.configService = configService;
    }
    isFallback() {
        return this.fallback;
    }
    async onModuleInit() {
        const host = this.configService.get('redis.host', 'localhost');
        const port = this.configService.get('redis.port', 6379);
        const password = this.configService.get('redis.password');
        const db = this.configService.get('redis.db', 0);
        const redis = new ioredis_1.default({
            host,
            port,
            password: password || undefined,
            db,
            maxRetriesPerRequest: 1,
            enableReadyCheck: true,
            lazyConnect: true,
            retryStrategy: () => null,
            connectTimeout: 1500,
        });
        redis.on('error', (error) => {
            this.logger.warn(`Redis connection error: ${error.message}`);
        });
        try {
            await Promise.race([
                redis.connect(),
                new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Redis connect timeout')), 2000);
                }),
            ]);
            this.client = redis;
            this.fallback = false;
            this.logger.log('Redis connected');
        }
        catch (error) {
            redis.disconnect();
            this.fallback = true;
            this.client = new memory_redis_1.MemoryRedis();
            this.logger.warn(`Redis is not running locally. Using in-memory store so the API can start (${error instanceof Error ? error.message : 'unavailable'})`);
        }
    }
    async onModuleDestroy() {
        if (this.client && !this.fallback) {
            await this.client.quit();
        }
    }
    getClient() {
        return this.client;
    }
    async ping() {
        return this.client.ping();
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map