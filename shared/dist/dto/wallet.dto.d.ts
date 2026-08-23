export declare const CRYPTO_ASSETS: readonly ["BTC", "ETH", "USDT", "USDC", "DOGE", "SOL"];
export type CryptoAsset = (typeof CRYPTO_ASSETS)[number];
export declare const WALLET_TRANSACTION_TYPES: readonly ["DEPOSIT", "WITHDRAWAL", "TRANSFER_IN", "TRANSFER_OUT", "ESCROW_HOLD", "ESCROW_RELEASE", "ESCROW_REFUND", "FEE"];
export type WalletTransactionType = (typeof WALLET_TRANSACTION_TYPES)[number];
export declare const WALLET_TRANSACTION_STATUSES: readonly ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"];
export type WalletTransactionStatus = (typeof WALLET_TRANSACTION_STATUSES)[number];
export declare const BANK_ACCOUNT_STATUSES: readonly ["PENDING_VERIFICATION", "VERIFIED", "REJECTED"];
export type BankAccountStatus = (typeof BANK_ACCOUNT_STATUSES)[number];
export declare const ESCROW_STATUSES: readonly ["HELD", "RELEASED", "REFUNDED", "DISPUTED"];
export type EscrowStatus = (typeof ESCROW_STATUSES)[number];
export interface FiatBalanceDto {
    available: number;
    pending: number;
    currency: string;
}
export interface CryptoBalanceDto {
    asset: CryptoAsset;
    balance: number;
    depositAddress: string | null;
}
export interface WalletBalanceResponseDto {
    fiat: FiatBalanceDto;
    crypto: CryptoBalanceDto[];
    escrowHeld: number;
}
export interface WalletTransactionDto {
    id: string;
    type: WalletTransactionType;
    status: WalletTransactionStatus;
    amount: number;
    fee: number;
    netAmount: number;
    currency: string;
    cryptoAsset: CryptoAsset | null;
    cryptoAmount: number | null;
    description: string | null;
    counterpartyUserId: string | null;
    createdAt: string;
    completedAt: string | null;
}
export interface WalletTransactionsResponseDto {
    items: WalletTransactionDto[];
    nextCursor: string | null;
    hasMore: boolean;
}
export interface DepositRequestDto {
    amount: number;
    currency?: string;
    idempotencyKey?: string;
}
export interface DepositResponseDto {
    transaction: WalletTransactionDto;
    clientSecret: string | null;
    checkoutUrl: string | null;
}
export interface WithdrawRequestDto {
    amount: number;
    bankAccountId: string;
    currency?: string;
    idempotencyKey?: string;
}
export interface TransferRequestDto {
    recipientUserId: string;
    amount: number;
    note?: string;
    idempotencyKey?: string;
}
export interface BankAccountDto {
    id: string;
    bankName: string;
    accountHolderName: string;
    country: string;
    last4: string;
    isDefault: boolean;
    status: BankAccountStatus;
    verifiedAt: string | null;
    createdAt: string;
}
export interface CreateBankAccountRequestDto {
    bankName: string;
    accountHolderName: string;
    country: string;
    accountNumber: string;
    routingNumber?: string;
    setAsDefault?: boolean;
}
export interface VerifyBankAccountRequestDto {
    verificationCode: string;
}
export interface CryptoAddressDto {
    asset: CryptoAsset;
    address: string;
    qrCodeDataUrl: string;
}
export interface CryptoWithdrawRequestDto {
    asset: CryptoAsset;
    amount: number;
    destinationAddress: string;
    idempotencyKey?: string;
}
export interface EscrowHoldDto {
    id: string;
    payerId: string;
    payeeId: string;
    amount: number;
    fee: number;
    currency: string;
    status: EscrowStatus;
    referenceType: string;
    referenceId: string;
    heldAt: string;
    releasedAt: string | null;
}
export interface CreateEscrowRequestDto {
    payeeId: string;
    amount: number;
    referenceType: string;
    referenceId: string;
    note?: string;
}
export interface ReleaseEscrowRequestDto {
    releaseNote?: string;
}
//# sourceMappingURL=wallet.dto.d.ts.map