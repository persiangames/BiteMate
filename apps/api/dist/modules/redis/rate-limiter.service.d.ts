import { RedisService } from './redis.service';
export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    retryAfterSeconds: number;
    count: number;
}
export declare class RateLimiterService {
    private readonly redisService;
    constructor(redisService: RedisService);
    consume(namespace: string, id: string, limit: number, windowSeconds: number): Promise<RateLimitResult>;
    getCount(namespace: string, id: string): Promise<number>;
    reset(namespace: string, id: string): Promise<void>;
}
