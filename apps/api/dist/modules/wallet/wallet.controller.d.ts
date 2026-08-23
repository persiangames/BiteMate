import type { Request } from 'express';
import type { BankAccountDto, DepositResponseDto, WalletBalanceResponseDto, WalletTransactionDto, WalletTransactionsResponseDto } from '@bitemate/shared';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CreateBankAccountDto, DepositDto, TransactionsQueryDto, TransferDto, VerifyBankAccountDto, WithdrawDto } from './dto/wallet.dto';
import { WalletService } from './wallet.service';
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    getBalance(user: JwtPayload): Promise<WalletBalanceResponseDto>;
    deposit(user: JwtPayload, dto: DepositDto, req: Request): Promise<DepositResponseDto>;
    withdraw(user: JwtPayload, dto: WithdrawDto, req: Request): Promise<WalletTransactionDto>;
    transfer(user: JwtPayload, dto: TransferDto, req: Request): Promise<WalletTransactionDto>;
    listTransactions(user: JwtPayload, query: TransactionsQueryDto): Promise<WalletTransactionsResponseDto>;
    listBankAccounts(user: JwtPayload): Promise<BankAccountDto[]>;
    addBankAccount(user: JwtPayload, dto: CreateBankAccountDto): Promise<BankAccountDto & {
        verificationCode?: string;
    }>;
    verifyBankAccount(user: JwtPayload, bankAccountId: string, dto: VerifyBankAccountDto): Promise<BankAccountDto>;
    setDefaultBankAccount(user: JwtPayload, bankAccountId: string): Promise<BankAccountDto>;
}
