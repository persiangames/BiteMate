import { ConfigService } from '@nestjs/config';
import type { RestaurantRankingsResponseDto, UserRankingsResponseDto } from '@bitemate/shared';
import type { Restaurant, User } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { FraudLogService } from '../wallet/fraud-log.service';
import { RankingCacheService } from './ranking-cache.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { RankingsQueryDto } from './dto/growth.dto';
export declare class RankingService {
    private readonly prisma;
    private readonly rankingCache;
    private readonly fraudLogService;
    private readonly notificationsService;
    private readonly configService;
    constructor(prisma: PrismaService, rankingCache: RankingCacheService, fraudLogService: FraudLogService, notificationsService: NotificationsService, configService: ConfigService);
    getUserRankings(query: RankingsQueryDto): Promise<UserRankingsResponseDto>;
    getRestaurantRankings(query: RankingsQueryDto): Promise<RestaurantRankingsResponseDto>;
    refreshUserRank(userId: string): Promise<number>;
    refreshRestaurantRank(restaurantId: string): Promise<number>;
    recordActivity(userId: string, points: number): Promise<void>;
    recordRestaurantVisit(restaurantId: string, visitorId?: string): Promise<void>;
    recordRestaurantConversion(restaurantId: string): Promise<void>;
    computeUserScore(params: {
        successfulMeetups: number;
        meetupRating: number;
        meetupReviewCount: number;
        activityPoints: number;
        isPremium: boolean;
        accountAgeDays: number;
        fraudPenalty: number;
    }): number;
    computeRestaurantScore(restaurant: Restaurant): number;
    isPremiumActive(user: Pick<User, 'isPremium' | 'premiumExpiresAt'>): boolean;
    private isEligibleForLeaderboard;
    private computeFraudPenalty;
    private countSuccessfulMeetups;
    private accountAgeDays;
    private conversionRate;
}
