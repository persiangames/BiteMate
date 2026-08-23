import { ConfigService } from '@nestjs/config';
import type { AvailabilityStatus, NearbyUserDto, UserRole } from '@bitemate/shared';
import { RedisService } from '../redis/redis.service';
interface GeoUserMeta {
    role: string;
    availability: AvailabilityStatus;
    username: string;
    fullName: string;
    profileImage: string;
    city: string;
    country: string;
}
export declare class GeoLocationService {
    private readonly redisService;
    private readonly configService;
    constructor(redisService: RedisService, configService: ConfigService);
    private get geoKey();
    private get ttlSeconds();
    private metaKey;
    upsertLiveLocation(userId: string, latitude: number, longitude: number, meta: GeoUserMeta): Promise<void>;
    removeLiveLocation(userId: string): Promise<void>;
    findNearby(params: {
        latitude: number;
        longitude: number;
        radiusKm: number;
        role?: UserRole;
        availability?: AvailabilityStatus;
        excludeUserId?: string;
    }): Promise<NearbyUserDto[]>;
}
export {};
