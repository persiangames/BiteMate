import { ConfigService } from '@nestjs/config';
import type { EscrowHoldDto } from '@bitemate/shared';
import { PrismaService } from '../database/prisma.service';
import { FraudContext, FraudLogService } from './fraud-log.service';
import { WalletCacheService } from './wallet-cache.service';
import type { CreateEscrowDto, ReleaseEscrowDto } from './dto/wallet.dto';
export declare class EscrowService {
    private readonly prisma;
    private readonly fraudLogService;
    private readonly walletCache;
    private readonly configService;
    constructor(prisma: PrismaService, fraudLogService: FraudLogService, walletCache: WalletCacheService, configService: ConfigService);
    createHold(payerId: string, dto: CreateEscrowDto, context: FraudContext): Promise<EscrowHoldDto>;
    releaseEscrow(actorId: string, escrowId: string, dto: ReleaseEscrowDto): Promise<EscrowHoldDto>;
    refundEscrow(actorId: string, escrowId: string): Promise<EscrowHoldDto>;
    private getEscrow;
    private calculateEscrowFee;
    private decimalToNumber;
    private toEscrowDto;
}
