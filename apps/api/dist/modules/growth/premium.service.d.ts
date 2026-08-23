import { ConfigService } from '@nestjs/config';
import type { PremiumStatusDto, PremiumSubscribeResponseDto } from '@bitemate/shared';
import type { User } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { FraudLogService } from '../wallet/fraud-log.service';
import type { PremiumSubscribeDto } from './dto/growth.dto';
export declare class PremiumService {
    private readonly prisma;
    private readonly configService;
    private readonly fraudLogService;
    constructor(prisma: PrismaService, configService: ConfigService, fraudLogService: FraudLogService);
    getStatus(userId: string): Promise<PremiumStatusDto>;
    subscribe(userId: string, dto: PremiumSubscribeDto): Promise<PremiumSubscribeResponseDto>;
    resolvePremium(userId: string): Promise<boolean>;
    isPremiumActive(user: Pick<User, 'isPremium' | 'premiumExpiresAt'>): boolean;
    getBenefits(): {
        dailyInviteLimit: number;
        unlimitedInvites: boolean;
        visibilityBoost: number;
        priorityRankingBoost: number;
        priorityMatchingBoost: number;
        removeLimits: boolean;
    };
    private syncExpiredPremium;
}
