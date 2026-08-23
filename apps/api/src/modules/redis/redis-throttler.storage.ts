import { Injectable } from '@nestjs/common';
import type { ThrottlerStorage } from '@nestjs/throttler';
import { RedisService } from './redis.service';

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  constructor(private readonly redisService: RedisService) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<{
    totalHits: number;
    timeToExpire: number;
    isBlocked: boolean;
    timeToBlockExpire: number;
  }> {
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
}
