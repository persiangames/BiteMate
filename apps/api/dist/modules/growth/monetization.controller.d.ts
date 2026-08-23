import type { AffiliateCommissionsResponseDto, RestaurantAdDto } from '@bitemate/shared';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { AdClickDto, CreateRestaurantAdDto } from './dto/growth.dto';
import { MonetizationService } from './monetization.service';
export declare class MonetizationController {
    private readonly monetizationService;
    constructor(monetizationService: MonetizationService);
    createAd(user: JwtPayload, dto: CreateRestaurantAdDto): Promise<RestaurantAdDto>;
    listMyAds(user: JwtPayload): Promise<RestaurantAdDto[]>;
    listActiveAds(): Promise<RestaurantAdDto[]>;
    recordImpression(adId: string): Promise<{
        recorded: boolean;
    }>;
    recordClick(adId: string, dto: AdClickDto): Promise<{
        recorded: boolean;
    }>;
    listCommissions(user: JwtPayload): Promise<AffiliateCommissionsResponseDto>;
}
