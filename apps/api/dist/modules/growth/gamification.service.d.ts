import type { MeetupReviewDto, UserBadgesResponseDto, UserLevelDto } from '@bitemate/shared';
import { PrismaService } from '../database/prisma.service';
import { RankingCacheService } from './ranking-cache.service';
import { RankingService } from './ranking.service';
import { RedisService } from '../redis/redis.service';
import { FraudDetectionService } from '../security/fraud-detection.service';
export declare class GamificationService {
    private readonly prisma;
    private readonly rankingService;
    private readonly rankingCache;
    private readonly redisService;
    private readonly fraudDetection;
    constructor(prisma: PrismaService, rankingService: RankingService, rankingCache: RankingCacheService, redisService: RedisService, fraudDetection: FraudDetectionService);
    getUserLevel(userId: string): Promise<UserLevelDto>;
    getUserBadges(userId: string): Promise<UserBadgesResponseDto>;
    recordMeetupParticipation(userId: string, meetupId: string, role: 'CREATOR' | 'INVITEE'): Promise<void>;
    recordPostActivity(userId: string): Promise<void>;
    submitMeetupReview(reviewerId: string, meetupId: string, reviewedUserId: string, rating: number, comment?: string): Promise<MeetupReviewDto>;
    syncUserProgress(userId: string): Promise<void>;
    private awardBadge;
    private recalculateMeetupRating;
    private getMeetupRating;
    private levelFromXp;
    private xpForLevel;
    private accountAgeDays;
    private toBadgeDto;
}
