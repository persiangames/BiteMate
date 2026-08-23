import type { MeetupReviewDto, UserBadgesResponseDto, UserLevelDto } from '@bitemate/shared';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CreateMeetupReviewDto } from './dto/growth.dto';
import { GamificationService } from './gamification.service';
export declare class GamificationController {
    private readonly gamificationService;
    constructor(gamificationService: GamificationService);
    getUserLevel(user: JwtPayload): Promise<UserLevelDto>;
    getUserBadges(user: JwtPayload): Promise<UserBadgesResponseDto>;
    submitMeetupReview(user: JwtPayload, dto: CreateMeetupReviewDto): Promise<MeetupReviewDto>;
}
