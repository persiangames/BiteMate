import type { ThrottlerStorage } from '@nestjs/throttler';
import { RedisService } from './redis.service';
export declare class RedisThrottlerStorage implements ThrottlerStorage {
    private readonly redisService;
    constructor(redisService: RedisService);
    increment(key: string, ttl: number, limit: number, blockDuration: number, throttlerName: string): Promise<{
        totalHits: number;
        timeToExpire: number;
        isBlocked: boolean;
        timeToBlockExpire: number;
    }>;
}
