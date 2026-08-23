import type { PremiumStatusDto, PremiumSubscribeResponseDto } from '@bitemate/shared';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { PremiumSubscribeDto } from './dto/growth.dto';
import { PremiumService } from './premium.service';
import { RankingService } from './ranking.service';
export declare class PremiumController {
    private readonly premiumService;
    private readonly rankingService;
    constructor(premiumService: PremiumService, rankingService: RankingService);
    getStatus(user: JwtPayload): Promise<PremiumStatusDto>;
    subscribe(user: JwtPayload, dto: PremiumSubscribeDto): Promise<PremiumSubscribeResponseDto>;
}
