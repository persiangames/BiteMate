import type { RestaurantDto, RestaurantMenuItemDto, RestaurantsListResponseDto } from '@bitemate/shared';
import { PrismaService } from '../database/prisma.service';
import { RankingService } from '../growth/ranking.service';
import type { CreateRestaurantDto, CreateRestaurantMenuItemDto, RestaurantsQueryDto } from './dto/marketplace.dto';
export declare class RestaurantsService {
    private readonly prisma;
    private readonly rankingService;
    constructor(prisma: PrismaService, rankingService: RankingService);
    createRestaurant(ownerId: string, dto: CreateRestaurantDto): Promise<RestaurantDto>;
    listRestaurants(query: RestaurantsQueryDto): Promise<RestaurantsListResponseDto>;
    getRestaurant(restaurantId: string, visitorId?: string): Promise<RestaurantDto>;
    addMenuItem(ownerId: string, restaurantId: string, dto: CreateRestaurantMenuItemDto): Promise<RestaurantMenuItemDto>;
    private validateOpeningHours;
    private toSummaryDto;
    private toMenuItemDto;
    private toRestaurantDto;
}
