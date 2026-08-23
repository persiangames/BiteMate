import type { HomeChefMenuItemDto, HomeChefProfileDto, HomeChefSummaryDto } from '@bitemate/shared';
import { PrismaService } from '../database/prisma.service';
import type { CreateHomeChefMenuDto, CreateHomeChefProfileDto, HomeChefMenuQueryDto } from './dto/marketplace.dto';
export declare class HomeChefService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    upsertProfile(userId: string, dto: CreateHomeChefProfileDto): Promise<HomeChefProfileDto>;
    getMyProfile(userId: string): Promise<HomeChefProfileDto>;
    getProfile(chefProfileId: string): Promise<HomeChefProfileDto>;
    createMenuItem(userId: string, dto: CreateHomeChefMenuDto): Promise<HomeChefMenuItemDto>;
    listMenuItems(query: HomeChefMenuQueryDto): Promise<HomeChefMenuItemDto[]>;
    listHomeChefs(): Promise<HomeChefSummaryDto[]>;
    private validateAvailability;
    private toMenuItemDto;
    private toProfileDto;
}
