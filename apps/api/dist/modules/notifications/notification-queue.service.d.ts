import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { NotificationDeliveryService } from './notification-delivery.service';
export interface NotificationQueueJob {
    notificationId: string;
    attempt: number;
}
export declare class NotificationQueueService implements OnModuleInit, OnModuleDestroy {
    private readonly redisService;
    private readonly deliveryService;
    private readonly configService;
    private readonly logger;
    private timer;
    private processing;
    constructor(redisService: RedisService, deliveryService: NotificationDeliveryService, configService: ConfigService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private get queueKey();
    private get retryQueueKey();
    enqueue(job: NotificationQueueJob): Promise<void>;
    processBatch(): Promise<void>;
    private processRetryQueue;
    private scheduleRetry;
}
