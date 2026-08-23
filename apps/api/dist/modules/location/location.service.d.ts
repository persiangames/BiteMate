import type { AuthUserDto, NearbyUsersResponseDto, UpdateLiveLocationRequestDto } from '@bitemate/shared';
import { PrismaService } from '../database/prisma.service';
import { GeoLocationService } from './geo-location.service';
import type { NearbyUsersQueryDto } from './dto/location.dto';
export declare class LocationService {
    private readonly prisma;
    private readonly geoLocationService;
    constructor(prisma: PrismaService, geoLocationService: GeoLocationService);
    updateLiveLocation(userId: string, dto: UpdateLiveLocationRequestDto): Promise<AuthUserDto>;
    findNearbyUsers(requesterId: string, query: NearbyUsersQueryDto): Promise<NearbyUsersResponseDto>;
    private findNearbyFromDatabase;
    syncRedisIndex(user: {
        id: string;
        liveLocationEnabled: boolean;
        invisibleMode: boolean;
        otpVerified: boolean;
        liveLatitude: number | null;
        liveLongitude: number | null;
        role: string | null;
        availabilityStatus: string;
        username: string | null;
        fullName: string | null;
        profileImage: string | null;
        city: string | null;
        country: string | null;
    }): Promise<void>;
    private validateCoordinates;
}
