import { ConfigService } from '@nestjs/config';
import type { MeetupMatchDto } from '@bitemate/shared';
import type { FoodMeetup, User } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { GeoLocationService } from '../location/geo-location.service';
import { MeetupCacheService } from './meetup-cache.service';
type MeetupWithCreator = FoodMeetup & {
    creator: Pick<User, 'id' | 'username' | 'fullName' | 'profileImage' | 'meetupRating' | 'meetupReviewCount' | 'isPremium' | 'rankScore'>;
};
export declare class MeetupMatchingService {
    private readonly prisma;
    private readonly meetupCache;
    private readonly geoLocationService;
    private readonly configService;
    constructor(prisma: PrismaService, meetupCache: MeetupCacheService, geoLocationService: GeoLocationService, configService: ConfigService);
    findMatches(meetup: MeetupWithCreator, requesterId: string): Promise<MeetupMatchDto[]>;
    private getExcludedUserIds;
    private scoreMeetupCandidates;
    private scoreUserCandidates;
    private toUserSummary;
}
export {};
