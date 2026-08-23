import { ConfigService } from '@nestjs/config';
import type { FoodIntentDto, FoodIntentListResponseDto, IntentDailyLimitDto, IntentMatchesResponseDto } from '@bitemate/shared';
import { PrismaService } from '../database/prisma.service';
import { MeetupCacheService } from '../meetups/meetup-cache.service';
import { NotificationsService } from '../notifications/notifications.service';
import { IntentCacheService } from './intent-cache.service';
import { IntentMatchingService } from './intent-matching.service';
import type { CreateIntentDto } from './dto/intent.dto';
export declare class IntentService {
    private readonly prisma;
    private readonly intentCache;
    private readonly meetupCache;
    private readonly matchingService;
    private readonly notificationsService;
    private readonly configService;
    constructor(prisma: PrismaService, intentCache: IntentCacheService, meetupCache: MeetupCacheService, matchingService: IntentMatchingService, notificationsService: NotificationsService, configService: ConfigService);
    createIntent(userId: string, dto: CreateIntentDto): Promise<FoodIntentDto>;
    getMatches(userId: string, intentId: string): Promise<IntentMatchesResponseDto>;
    cancelIntent(userId: string, intentId: string): Promise<FoodIntentDto>;
    listMyIntents(userId: string): Promise<FoodIntentListResponseDto>;
    getDailyLimit(userId: string): Promise<IntentDailyLimitDto>;
    private assertCanCreateIntent;
    private getIntentForUser;
    private getUserCancelCount;
    private toIntentDto;
}
