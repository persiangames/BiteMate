import { ConfigService } from '@nestjs/config';
import type { IntentMatchDto } from '@bitemate/shared';
import type { FoodIntent, User } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { GeoLocationService } from '../location/geo-location.service';
import { IntentCacheService } from './intent-cache.service';
type IntentWithUser = FoodIntent & {
    user: Pick<User, 'id' | 'username' | 'fullName' | 'profileImage' | 'role' | 'meetupRating' | 'meetupReviewCount' | 'successfulMeetups' | 'isPremium' | 'rankScore'>;
};
export declare class IntentMatchingService {
    private readonly prisma;
    private readonly intentCache;
    private readonly geoLocationService;
    private readonly configService;
    constructor(prisma: PrismaService, intentCache: IntentCacheService, geoLocationService: GeoLocationService, configService: ConfigService);
    findMatches(sourceIntent: IntentWithUser): Promise<IntentMatchDto[]>;
    refreshMatchesForNearbyIntents(sourceIntent: IntentWithUser): Promise<void>;
    private scoreIntentCandidates;
    private scoreUserCandidates;
    private buildScoreBreakdown;
    private getCancelCounts;
    private metaToUserSummary;
    private metaToIntentDto;
    private toUserSummary;
}
export {};
