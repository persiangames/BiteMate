import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  count: number;
}

@Injectable()
export class RateLimiterService {
  constructor(private readonly redisService: RedisService) {}

  async consume(
    namespace: string,
    id: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitResult> {
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

  async getCount(namespace: string, id: string): Promise<number> {
    const raw = await this.redisService.getClient().get(`bitemate:limit:${namespace}:${id}`);
    return raw ? Number.parseInt(raw, 10) || 0 : 0;
  }

  async reset(namespace: string, id: string): Promise<void> {
    await this.redisService.getClient().del(`bitemate:limit:${namespace}:${id}`);
  }
}
