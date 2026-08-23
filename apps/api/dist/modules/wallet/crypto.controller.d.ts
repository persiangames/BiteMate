import type { Request } from 'express';
import type { CryptoAddressDto, WalletTransactionDto } from '@bitemate/shared';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CryptoWithdrawDto } from './dto/wallet.dto';
import { WalletService } from './wallet.service';
export declare class CryptoController {
    private readonly walletService;
    constructor(walletService: WalletService);
    listAddresses(user: JwtPayload): Promise<CryptoAddressDto[]>;
    withdraw(user: JwtPayload, dto: CryptoWithdrawDto, req: Request): Promise<WalletTransactionDto>;
}
