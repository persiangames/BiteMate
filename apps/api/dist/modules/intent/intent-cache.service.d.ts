import { ConfigService } from '@nestjs/config';
import type { FoodIntentStatus } from '@prisma/client';
import { RedisService } from '../redis/redis.service';
export interface CachedIntentMeta {
    id: string;
    userId: string;
    foodType: string;
    foodCategory: string;
    timeStart: string;
    timeEnd: string;
    radiusKm: string;
    desiredPeople: string;
    latitude: string;
    longitude: string;
    budgetMin: string;
    budgetMax: string;
    status: FoodIntentStatus;
    userRating: string;
    userReviewCount: string;
    userSuccessfulMeetups: string;
    userCancelCount: string;
    userRankScore: string;
    userRole: string;
    isPremium: string;
}
export declare class IntentCacheService {
    private readonly redisService;
    private readonly configService;
    constructor(redisService: RedisService, configService: ConfigService);
    private get geoKey();
    private get metaPrefix();
    private get foodIndexPrefix();
    private get matchCachePrefix();
    normalizeFoodType(foodType: string): string;
    private metaKey;
    private foodKey;
    private matchKey;
    cacheActiveIntent(meta: CachedIntentMeta, expiresAt: Date): Promise<void>;
    removeIntent(intentId: string, foodType: string): Promise<void>;
    getIntentMeta(intentId: string): Promise<CachedIntentMeta | null>;
    getIntentMetaBatch(intentIds: string[]): Promise<Map<string, CachedIntentMeta>>;
    findNearbyIntentIds(params: {
        latitude: number;
        longitude: number;
        radiusKm: number;
    }): Promise<Array<{
        intentId: string;
        distanceKm: number;
    }>>;
    getFoodTypeIntentIds(normalizedFood: string): Promise<string[]>;
    setMatchCache(intentId: string, payload: string, ttlSeconds: number): Promise<void>;
    getMatchCache(intentId: string): Promise<string | null>;
    invalidateMatchCache(intentId: string): Promise<void>;
}
