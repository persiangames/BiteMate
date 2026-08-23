import type { Request } from 'express';
import type { EscrowHoldDto } from '@bitemate/shared';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CreateEscrowDto, ReleaseEscrowDto } from './dto/wallet.dto';
import { EscrowService } from './escrow.service';
export declare class EscrowController {
    private readonly escrowService;
    constructor(escrowService: EscrowService);
    createHold(user: JwtPayload, dto: CreateEscrowDto, req: Request): Promise<EscrowHoldDto>;
    release(user: JwtPayload, escrowId: string, dto: ReleaseEscrowDto): Promise<EscrowHoldDto>;
    refund(user: JwtPayload, escrowId: string): Promise<EscrowHoldDto>;
}
