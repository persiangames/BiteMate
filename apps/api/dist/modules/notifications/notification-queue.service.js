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
var NotificationQueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationQueueService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_service_1 = require("../redis/redis.service");
const notification_delivery_service_1 = require("./notification-delivery.service");
let NotificationQueueService = NotificationQueueService_1 = class NotificationQueueService {
    redisService;
    deliveryService;
    configService;
    logger = new common_1.Logger(NotificationQueueService_1.name);
    timer = null;
    processing = false;
    constructor(redisService, deliveryService, configService) {
        this.redisService = redisService;
        this.deliveryService = deliveryService;
        this.configService = configService;
    }
    onModuleInit() {
        this.timer = setInterval(() => {
            void this.processBatch();
        }, 250);
    }
    onModuleDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
    get queueKey() {
        return this.configService.get('notification.queueKey', 'bitemate:notifications:queue');
    }
    get retryQueueKey() {
        return this.configService.get('notification.retryQueueKey', 'bitemate:notifications:retry');
    }
    async enqueue(job) {
        const client = this.redisService.getClient();
        await client.lpush(this.queueKey, JSON.stringify(job));
    }
    async processBatch() {
        if (this.processing) {
            return;
        }
        this.processing = true;
        try {
            const batchSize = this.configService.get('notification.batchSize', 50);
            const client = this.redisService.getClient();
            await this.processRetryQueue(client, batchSize);
            for (let index = 0; index < batchSize; index += 1) {
                const raw = await client.rpop(this.queueKey);
                if (!raw) {
                    break;
                }
                const job = JSON.parse(raw);
                const delivered = await this.deliveryService.deliver(job.notificationId);
                if (!delivered) {
                    await this.scheduleRetry(job);
                }
            }
        }
        catch (error) {
            this.logger.error(`Notification queue processing failed: ${error instanceof Error ? error.message : error}`);
        }
        finally {
            this.processing = false;
        }
    }
    async processRetryQueue(client, batchSize) {
        const now = Date.now();
        const dueJobs = await client.zrangebyscore(this.retryQueueKey, 0, now, 'LIMIT', 0, batchSize);
        for (const raw of dueJobs) {
            await client.zrem(this.retryQueueKey, raw);
            await client.lpush(this.queueKey, raw);
        }
    }
    async scheduleRetry(job) {
        const maxRetries = this.configService.get('notification.maxRetries', 5);
        const retryDelayMs = this.configService.get('notification.retryDelayMs', 3000);
        if (job.attempt >= maxRetries) {
            this.logger.warn(`Notification ${job.notificationId} exceeded retry limit`);
            return;
        }
        const nextJob = {
            notificationId: job.notificationId,
            attempt: job.attempt + 1,
        };
        const client = this.redisService.getClient();
        await client.zadd(this.retryQueueKey, Date.now() + retryDelayMs * nextJob.attempt, JSON.stringify(nextJob));
    }
};
exports.NotificationQueueService = NotificationQueueService;
exports.NotificationQueueService = NotificationQueueService = NotificationQueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        notification_delivery_service_1.NotificationDeliveryService,
        config_1.ConfigService])
], NotificationQueueService);
//# sourceMappingURL=notification-queue.service.js.map