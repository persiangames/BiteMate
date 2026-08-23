import { ConfigService } from '@nestjs/config';
import type { MeetupStatus } from '@prisma/client';
import { RedisService } from '../redis/redis.service';
export interface CachedMeetupMeta {
    id: string;
    creatorId: string;
    foodType: string;
    foodCategory: string;
    scheduledAt: string;
    radiusKm: string;
    desiredPeople: string;
    latitude: string;
    longitude: string;
    status: MeetupStatus;
    creatorRating: string;
}
export declare class MeetupCacheService {
    private readonly redisService;
    private readonly configService;
    constructor(redisService: RedisService, configService: ConfigService);
    private get geoKey();
    private get metaPrefix();
    private get foodIndexPrefix();
    normalizeFoodType(foodType: string): string;
    private metaKey;
    private foodKey;
    private inviteCountKey;
    cacheActiveMeetup(meta: CachedMeetupMeta, expiresAt: Date): Promise<void>;
    removeMeetup(meetupId: string, foodType: string): Promise<void>;
    getMeetupMeta(meetupId: string): Promise<CachedMeetupMeta | null>;
    findNearbyMeetupIds(params: {
        latitude: number;
        longitude: number;
        radiusKm: number;
    }): Promise<Array<{
        meetupId: string;
        distanceKm: number;
    }>>;
    getFoodTypeMeetupIds(normalizedFood: string): Promise<string[]>;
    incrementDailyInviteCount(userId: string): Promise<number>;
    getDailyInviteCount(userId: string): Promise<number>;
}
