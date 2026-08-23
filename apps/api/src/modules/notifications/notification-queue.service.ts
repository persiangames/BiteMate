import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { NotificationDeliveryService } from './notification-delivery.service';

export interface NotificationQueueJob {
  notificationId: string;
  attempt: number;
}

@Injectable()
export class NotificationQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationQueueService.name);
  private timer: NodeJS.Timeout | null = null;
  private processing = false;

  constructor(
    private readonly redisService: RedisService,
    private readonly deliveryService: NotificationDeliveryService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit(): void {
    this.timer = setInterval(() => {
      void this.processBatch();
    }, 250);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private get queueKey(): string {
    return this.configService.get<string>('notification.queueKey', 'bitemate:notifications:queue')!;
  }

  private get retryQueueKey(): string {
    return this.configService.get<string>(
      'notification.retryQueueKey',
      'bitemate:notifications:retry',
    )!;
  }

  async enqueue(job: NotificationQueueJob): Promise<void> {
    const client = this.redisService.getClient();
    await client.lpush(this.queueKey, JSON.stringify(job));
  }

  async processBatch(): Promise<void> {
    if (this.processing) {
      return;
    }

    this.processing = true;
    try {
      const batchSize = this.configService.get<number>('notification.batchSize', 50)!;
      const client = this.redisService.getClient();

      await this.processRetryQueue(client, batchSize);

      for (let index = 0; index < batchSize; index += 1) {
        const raw = await client.rpop(this.queueKey);
        if (!raw) {
          break;
        }

        const job = JSON.parse(raw) as NotificationQueueJob;
        const delivered = await this.deliveryService.deliver(job.notificationId);

        if (!delivered) {
          await this.scheduleRetry(job);
        }
      }
    } catch (error) {
      this.logger.error(
        `Notification queue processing failed: ${error instanceof Error ? error.message : error}`,
      );
    } finally {
      this.processing = false;
    }
  }

  private async processRetryQueue(
    client: ReturnType<RedisService['getClient']>,
    batchSize: number,
  ): Promise<void> {
    const now = Date.now();
    const dueJobs = await client.zrangebyscore(this.retryQueueKey, 0, now, 'LIMIT', 0, batchSize);

    for (const raw of dueJobs) {
      await client.zrem(this.retryQueueKey, raw);
      await client.lpush(this.queueKey, raw);
    }
  }

  private async scheduleRetry(job: NotificationQueueJob): Promise<void> {
    const maxRetries = this.configService.get<number>('notification.maxRetries', 5)!;
    const retryDelayMs = this.configService.get<number>('notification.retryDelayMs', 3000)!;

    if (job.attempt >= maxRetries) {
      this.logger.warn(`Notification ${job.notificationId} exceeded retry limit`);
      return;
    }

    const nextJob: NotificationQueueJob = {
      notificationId: job.notificationId,
      attempt: job.attempt + 1,
    };

    const client = this.redisService.getClient();
    await client.zadd(
      this.retryQueueKey,
      Date.now() + retryDelayMs * nextJob.attempt,
      JSON.stringify(nextJob),
    );
  }
}
