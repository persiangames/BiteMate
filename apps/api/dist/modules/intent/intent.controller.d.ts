import type { FoodIntentDto, FoodIntentListResponseDto, IntentDailyLimitDto, IntentMatchesResponseDto } from '@bitemate/shared';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CancelIntentDto, CreateIntentDto, IntentMatchQueryDto } from './dto/intent.dto';
import { IntentService } from './intent.service';
export declare class IntentController {
    private readonly intentService;
    constructor(intentService: IntentService);
    createIntent(user: JwtPayload, dto: CreateIntentDto): Promise<FoodIntentDto>;
    getMatches(user: JwtPayload, query: IntentMatchQueryDto): Promise<IntentMatchesResponseDto>;
    cancelIntent(user: JwtPayload, dto: CancelIntentDto): Promise<FoodIntentDto>;
    listMyIntents(user: JwtPayload): Promise<FoodIntentListResponseDto>;
    getDailyLimit(user: JwtPayload): Promise<IntentDailyLimitDto>;
}
