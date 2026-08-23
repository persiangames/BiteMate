"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ESCROW_STATUSES = exports.BANK_ACCOUNT_STATUSES = exports.WALLET_TRANSACTION_STATUSES = exports.WALLET_TRANSACTION_TYPES = exports.CRYPTO_ASSETS = void 0;
exports.CRYPTO_ASSETS = ['BTC', 'ETH', 'USDT', 'USDC', 'DOGE', 'SOL'];
exports.WALLET_TRANSACTION_TYPES = [
    'DEPOSIT',
    'WITHDRAWAL',
    'TRANSFER_IN',
    'TRANSFER_OUT',
    'ESCROW_HOLD',
    'ESCROW_RELEASE',
    'ESCROW_REFUND',
    'FEE',
];
exports.WALLET_TRANSACTION_STATUSES = [
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'CANCELLED',
];
exports.BANK_ACCOUNT_STATUSES = [
    'PENDING_VERIFICATION',
    'VERIFIED',
    'REJECTED',
];
exports.ESCROW_STATUSES = ['HELD', 'RELEASED', 'REFUNDED', 'DISPUTED'];
//# sourceMappingURL=wallet.dto.js.map