import { ConfigService } from '@nestjs/config';
import type { RestaurantRankingsResponseDto, UserRankingsResponseDto } from '@bitemate/shared';
import { RedisService } from '../redis/redis.service';
export declare class RankingCacheService {
    private readonly redisService;
    private readonly configService;
    constructor(redisService: RedisService, configService: ConfigService);
    private ttl;
    private dailyActivityCap;
    getUserRankings(cityKey: string): Promise<UserRankingsResponseDto | null>;
    setUserRankings(cityKey: string, data: UserRankingsResponseDto): Promise<void>;
    getRestaurantRankings(cityKey: string): Promise<RestaurantRankingsResponseDto | null>;
    setRestaurantRankings(cityKey: string, data: RestaurantRankingsResponseDto): Promise<void>;
    invalidateAll(): Promise<void>;
    consumeActivityBudget(userId: string, requested: number): Promise<number>;
    markRestaurantVisit(restaurantId: string, visitorId: string): Promise<boolean>;
    private userKey;
    private restaurantKey;
    private todayKey;
}
