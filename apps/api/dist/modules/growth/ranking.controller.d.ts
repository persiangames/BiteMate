import type { RestaurantRankingsResponseDto, UserRankingsResponseDto } from '@bitemate/shared';
import { RankingsQueryDto } from './dto/growth.dto';
import { RankingService } from './ranking.service';
export declare class RankingController {
    private readonly rankingService;
    constructor(rankingService: RankingService);
    getUserRankings(query: RankingsQueryDto): Promise<UserRankingsResponseDto>;
    getRestaurantRankings(query: RankingsQueryDto): Promise<RestaurantRankingsResponseDto>;
}
