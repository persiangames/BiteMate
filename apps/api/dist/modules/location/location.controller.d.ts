import type { AuthUserDto, NearbyUsersResponseDto } from '@bitemate/shared';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { NearbyUsersQueryDto, UpdateLiveLocationDto } from './dto/location.dto';
import { LocationService } from './location.service';
export declare class LocationController {
    private readonly locationService;
    constructor(locationService: LocationService);
    updateLiveLocation(user: JwtPayload, dto: UpdateLiveLocationDto): Promise<AuthUserDto>;
}
export declare class NearbyUsersController {
    private readonly locationService;
    constructor(locationService: LocationService);
    findNearby(user: JwtPayload, query: NearbyUsersQueryDto): Promise<NearbyUsersResponseDto>;
}
