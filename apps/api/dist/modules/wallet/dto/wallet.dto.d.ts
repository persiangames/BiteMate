import { type CryptoAsset } from '@bitemate/shared';
export declare class DepositDto {
    amount: number;
    currency?: string;
    idempotencyKey?: string;
}
export declare class WithdrawDto {
    amount: number;
    bankAccountId: string;
    currency?: string;
    idempotencyKey?: string;
}
export declare class TransferDto {
    recipientUserId: string;
    amount: number;
    note?: string;
    idempotencyKey?: string;
}
export declare class CreateBankAccountDto {
    bankName: string;
    accountHolderName: string;
    country: string;
    accountNumber: string;
    routingNumber?: string;
    setAsDefault?: boolean;
}
export declare class VerifyBankAccountDto {
    verificationCode: string;
}
export declare class CryptoWithdrawDto {
    asset: CryptoAsset;
    amount: number;
    destinationAddress: string;
    idempotencyKey?: string;
}
export declare class CreateEscrowDto {
    payeeId: string;
    amount: number;
    referenceType: string;
    referenceId: string;
    note?: string;
}
export declare class ReleaseEscrowDto {
    releaseNote?: string;
}
export declare class TransactionsQueryDto {
    cursor?: string;
    limit: number;
}
