import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { MemoryRedis } from './memory-redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis = new MemoryRedis() as unknown as Redis;
  private fallback = true;

  constructor(private readonly configService: ConfigService) {}

  isFallback(): boolean {
    return this.fallback;
  }

  async onModuleInit(): Promise<void> {
    const host = this.configService.get<string>('redis.host', 'localhost');
    const port = this.configService.get<number>('redis.port', 6379);
    const password = this.configService.get<string>('redis.password');
    const db = this.configService.get<number>('redis.db', 0);

    const redis = new Redis({
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

    redis.on('error', (error: Error) => {
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
    } catch (error) {
      redis.disconnect();
      this.fallback = true;
      this.client = new MemoryRedis() as unknown as Redis;
      this.logger.warn(
        `Redis is not running locally. Using in-memory store so the API can start (${
          error instanceof Error ? error.message : 'unavailable'
        })`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client && !this.fallback) {
      await this.client.quit();
    }
  }

  getClient(): Redis {
    return this.client;
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }
}
