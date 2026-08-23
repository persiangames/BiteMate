import { ConfigService } from '@nestjs/config';
import type { AffiliateCommissionsResponseDto, RestaurantAdDto } from '@bitemate/shared';
import { PrismaService } from '../database/prisma.service';
import { FraudLogService } from '../wallet/fraud-log.service';
import { RankingService } from './ranking.service';
import type { CreateRestaurantAdDto } from './dto/growth.dto';
export declare class MonetizationService {
    private readonly prisma;
    private readonly configService;
    private readonly fraudLogService;
    private readonly rankingService;
    constructor(prisma: PrismaService, configService: ConfigService, fraudLogService: FraudLogService, rankingService: RankingService);
    createRestaurantAd(ownerId: string, dto: CreateRestaurantAdDto): Promise<RestaurantAdDto>;
    listRestaurantAds(ownerId: string): Promise<RestaurantAdDto[]>;
    listActiveAds(limit?: number): Promise<RestaurantAdDto[]>;
    recordAdImpression(adId: string): Promise<void>;
    recordAdClick(adId: string, referrerUserId?: string): Promise<void>;
    handleBookingCompleted(bookingId: string, restaurantId: string | null, affiliateReferrerId: string | null, totalPrice: number): Promise<void>;
    listAffiliateCommissions(userId: string): Promise<AffiliateCommissionsResponseDto>;
    private createAffiliateCommission;
    private toAdDto;
    private toCommissionDto;
}
