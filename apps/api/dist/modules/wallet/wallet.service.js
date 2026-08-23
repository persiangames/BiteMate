"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const node_crypto_1 = require("node:crypto");
const qrcode_1 = __importDefault(require("qrcode"));
const prisma_service_1 = require("../database/prisma.service");
const coinbase_service_1 = require("./coinbase.service");
const encryption_service_1 = require("./encryption.service");
const fraud_log_service_1 = require("./fraud-log.service");
const stripe_service_1 = require("./stripe.service");
const wallet_cache_service_1 = require("./wallet-cache.service");
const notifications_service_1 = require("../notifications/notifications.service");
const environment_util_1 = require("../../common/utils/environment.util");
let WalletService = class WalletService {
    prisma;
    encryptionService;
    fraudLogService;
    walletCache;
    stripeService;
    coinbaseService;
    notificationsService;
    configService;
    constructor(prisma, encryptionService, fraudLogService, walletCache, stripeService, coinbaseService, notificationsService, configService) {
        this.prisma = prisma;
        this.encryptionService = encryptionService;
        this.fraudLogService = fraudLogService;
        this.walletCache = walletCache;
        this.stripeService = stripeService;
        this.coinbaseService = coinbaseService;
        this.notificationsService = notificationsService;
        this.configService = configService;
    }
    async getBalance(userId) {
        const cached = await this.walletCache.getBalance(userId);
        if (cached) {
            return cached;
        }
        const wallet = await this.ensureFiatWallet(userId);
        const addresses = await this.prisma.cryptoDepositAddress.findMany({
            where: { userId },
        });
        const escrowHeld = await this.prisma.escrowHold.aggregate({
            where: { payerId: userId, status: 'HELD' },
            _sum: { amount: true },
        });
        const balance = {
            fiat: {
                available: this.decimalToNumber(wallet.availableBalance),
                pending: this.decimalToNumber(wallet.pendingBalance),
                currency: wallet.currency,
            },
            crypto: addresses.map((entry) => ({
                asset: entry.asset,
                balance: 0,
                depositAddress: entry.address,
            })),
            escrowHeld: this.decimalToNumber(escrowHeld._sum.amount ?? 0),
        };
        await this.walletCache.setBalance(userId, balance);
        return balance;
    }
    async deposit(userId, dto, context) {
        await this.assertIdempotency(userId, dto.idempotencyKey);
        const fee = this.calculateDepositFee(dto.amount);
        const netAmount = dto.amount - fee;
        const currency = dto.currency ?? 'USD';
        const dailyVolume = await this.getDailyVolume(userId);
        const riskScore = this.fraudLogService.computeRiskScore({
            amount: dto.amount,
            dailyVolume,
        });
        await this.fraudLogService.log(userId, 'WALLET_DEPOSIT_INIT', riskScore, {
            ...context,
            details: { amount: dto.amount, currency },
        });
        if (riskScore >= 80) {
            throw new common_1.ForbiddenException('Deposit blocked for security review');
        }
        const stripe = await this.stripeService.createDepositIntent({
            amountCents: Math.round(dto.amount * 100),
            currency,
            userId,
        });
        if (stripe.mock && (0, environment_util_1.isProductionEnv)(this.configService.get('app.nodeEnv'))) {
            throw new common_1.ServiceUnavailableException('Card deposits require Stripe in production');
        }
        let transaction = await this.prisma.walletTransaction.create({
            data: {
                userId,
                type: 'DEPOSIT',
                status: stripe.mock ? 'COMPLETED' : 'PENDING',
                amount: dto.amount,
                fee,
                netAmount,
                currency,
                provider: stripe.mock ? 'INTERNAL' : 'STRIPE',
                providerReferenceId: stripe.paymentIntentId,
                description: 'Card deposit',
                idempotencyKey: dto.idempotencyKey,
                completedAt: stripe.mock ? new Date() : undefined,
            },
        });
        if (stripe.mock) {
            await this.creditFiatWallet(userId, netAmount);
            transaction = await this.prisma.walletTransaction.findUniqueOrThrow({
                where: { id: transaction.id },
            });
            void this.notifyPaymentReceived(userId, transaction);
        }
        await this.walletCache.invalidateUser(userId);
        return {
            transaction: this.toTransactionDto(transaction),
            clientSecret: stripe.clientSecret,
            checkoutUrl: null,
        };
    }
    async withdraw(userId, dto, context) {
        await this.assertIdempotency(userId, dto.idempotencyKey);
        const bankAccount = await this.prisma.bankAccount.findFirst({
            where: { id: dto.bankAccountId, userId },
        });
        if (!bankAccount) {
            throw new common_1.NotFoundException('Bank account not found');
        }
        if (bankAccount.status !== 'VERIFIED') {
            throw new common_1.BadRequestException('Bank account must be verified before withdrawal');
        }
        const wallet = await this.ensureFiatWallet(userId);
        const fee = this.calculateWithdrawFee(dto.amount);
        const totalDebit = dto.amount + fee;
        const available = this.decimalToNumber(wallet.availableBalance);
        if (available < totalDebit) {
            throw new common_1.BadRequestException('Insufficient available balance');
        }
        const dailyVolume = await this.getDailyVolume(userId);
        const riskScore = this.fraudLogService.computeRiskScore({
            amount: dto.amount,
            dailyVolume,
            isNewBankAccount: !bankAccount.verifiedAt,
        });
        await this.fraudLogService.log(userId, 'WALLET_WITHDRAW_INIT', riskScore, {
            ...context,
            details: { amount: dto.amount, bankAccountId: dto.bankAccountId },
        });
        if (riskScore >= 85) {
            throw new common_1.ForbiddenException('Withdrawal blocked for security review');
        }
        const transaction = await this.prisma.$transaction(async (tx) => {
            await tx.fiatWallet.update({
                where: { userId },
                data: { availableBalance: { decrement: totalDebit } },
            });
            return tx.walletTransaction.create({
                data: {
                    userId,
                    type: 'WITHDRAWAL',
                    status: 'PROCESSING',
                    amount: dto.amount,
                    fee,
                    netAmount: dto.amount,
                    currency: dto.currency ?? wallet.currency,
                    provider: 'STRIPE',
                    description: `Withdrawal to bank •••• ${bankAccount.last4}`,
                    idempotencyKey: dto.idempotencyKey,
                    metadata: { bankAccountId: bankAccount.id },
                },
            });
        });
        const completed = await this.prisma.walletTransaction.update({
            where: { id: transaction.id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
            },
        });
        await this.walletCache.invalidateUser(userId);
        return this.toTransactionDto(completed);
    }
    async transfer(userId, dto, context) {
        if (userId === dto.recipientUserId) {
            throw new common_1.BadRequestException('Cannot transfer to yourself');
        }
        await this.assertIdempotency(userId, dto.idempotencyKey);
        const recipient = await this.prisma.user.findFirst({
            where: { id: dto.recipientUserId, isActive: true },
        });
        if (!recipient) {
            throw new common_1.NotFoundException('Recipient not found');
        }
        const fee = this.calculateTransferFee(dto.amount);
        const totalDebit = dto.amount + fee;
        await this.fraudLogService.log(userId, 'WALLET_TRANSFER', 10, {
            ...context,
            details: { amount: dto.amount, recipientUserId: dto.recipientUserId },
        });
        const outbound = await this.prisma.$transaction(async (tx) => {
            const senderWallet = await tx.fiatWallet.findUnique({ where: { userId } });
            if (!senderWallet || this.decimalToNumber(senderWallet.availableBalance) < totalDebit) {
                throw new common_1.BadRequestException('Insufficient available balance');
            }
            await tx.fiatWallet.update({
                where: { userId },
                data: { availableBalance: { decrement: totalDebit } },
            });
            await this.ensureFiatWalletInTx(tx, dto.recipientUserId);
            await tx.fiatWallet.update({
                where: { userId: dto.recipientUserId },
                data: { availableBalance: { increment: dto.amount } },
            });
            const sent = await tx.walletTransaction.create({
                data: {
                    userId,
                    type: 'TRANSFER_OUT',
                    status: 'COMPLETED',
                    amount: dto.amount,
                    fee,
                    netAmount: dto.amount,
                    currency: senderWallet.currency,
                    provider: 'INTERNAL',
                    counterpartyUserId: dto.recipientUserId,
                    description: dto.note ?? 'Internal transfer',
                    idempotencyKey: dto.idempotencyKey,
                    completedAt: new Date(),
                },
            });
            await tx.walletTransaction.create({
                data: {
                    userId: dto.recipientUserId,
                    type: 'TRANSFER_IN',
                    status: 'COMPLETED',
                    amount: dto.amount,
                    fee: 0,
                    netAmount: dto.amount,
                    currency: senderWallet.currency,
                    provider: 'INTERNAL',
                    counterpartyUserId: userId,
                    description: dto.note ?? 'Internal transfer received',
                    completedAt: new Date(),
                },
            });
            return sent;
        });
        await this.walletCache.invalidateUser(userId);
        await this.walletCache.invalidateUser(dto.recipientUserId);
        return this.toTransactionDto(outbound);
    }
    async listTransactions(userId, cursor, limit = 30) {
        const rows = await this.prisma.walletTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        });
        const hasMore = rows.length > limit;
        const items = hasMore ? rows.slice(0, limit) : rows;
        return {
            items: items.map((row) => this.toTransactionDto(row)),
            nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
            hasMore,
        };
    }
    async addBankAccount(userId, dto) {
        const last4 = dto.accountNumber.slice(-4);
        const verificationCode = (0, node_crypto_1.randomInt)(100000, 999999).toString();
        if (dto.setAsDefault) {
            await this.prisma.bankAccount.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }
        const account = await this.prisma.bankAccount.create({
            data: {
                userId,
                bankName: dto.bankName.trim(),
                accountHolderName: dto.accountHolderName.trim(),
                country: dto.country.trim(),
                encryptedAccountNumber: this.encryptionService.encrypt(dto.accountNumber),
                encryptedRoutingNumber: dto.routingNumber
                    ? this.encryptionService.encrypt(dto.routingNumber)
                    : null,
                last4,
                isDefault: dto.setAsDefault ?? false,
                verificationTokenHash: this.encryptionService.hash(verificationCode),
            },
        });
        await this.fraudLogService.log(userId, 'BANK_ACCOUNT_ADDED', 15, {
            details: { bankAccountId: account.id, last4 },
        });
        return this.toBankAccountDto(account, verificationCode);
    }
    async listBankAccounts(userId) {
        const accounts = await this.prisma.bankAccount.findMany({
            where: { userId },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
        return accounts.map((account) => this.toBankAccountDto(account));
    }
    async verifyBankAccount(userId, bankAccountId, dto) {
        const account = await this.prisma.bankAccount.findFirst({
            where: { id: bankAccountId, userId },
        });
        if (!account) {
            throw new common_1.NotFoundException('Bank account not found');
        }
        const hash = this.encryptionService.hash(dto.verificationCode);
        if (account.verificationTokenHash !== hash) {
            await this.fraudLogService.log(userId, 'BANK_VERIFY_FAILED', 40, {
                details: { bankAccountId },
            });
            throw new common_1.BadRequestException('Invalid verification code');
        }
        const updated = await this.prisma.bankAccount.update({
            where: { id: bankAccountId },
            data: {
                status: 'VERIFIED',
                verifiedAt: new Date(),
                verificationTokenHash: null,
            },
        });
        return this.toBankAccountDto(updated);
    }
    async setDefaultBankAccount(userId, bankAccountId) {
        const account = await this.prisma.bankAccount.findFirst({
            where: { id: bankAccountId, userId, status: 'VERIFIED' },
        });
        if (!account) {
            throw new common_1.NotFoundException('Verified bank account not found');
        }
        await this.prisma.$transaction([
            this.prisma.bankAccount.updateMany({
                where: { userId },
                data: { isDefault: false },
            }),
            this.prisma.bankAccount.update({
                where: { id: bankAccountId },
                data: { isDefault: true },
            }),
        ]);
        const updated = await this.prisma.bankAccount.findUniqueOrThrow({
            where: { id: bankAccountId },
        });
        return this.toBankAccountDto(updated);
    }
    async getOrCreateCryptoAddress(userId, asset) {
        let entry = await this.prisma.cryptoDepositAddress.findUnique({
            where: { userId_asset: { userId, asset } },
        });
        if (!entry) {
            const address = this.coinbaseService.generateMockAddress(userId, asset);
            entry = await this.prisma.cryptoDepositAddress.create({
                data: { userId, asset, address },
            });
        }
        const qrCodeDataUrl = await qrcode_1.default.toDataURL(entry.address, { width: 256, margin: 1 });
        return { asset: entry.asset, address: entry.address, qrCodeDataUrl };
    }
    async listCryptoAddresses(userId) {
        const assets = ['BTC', 'ETH', 'USDT', 'USDC', 'DOGE', 'SOL'];
        return Promise.all(assets.map((asset) => this.getOrCreateCryptoAddress(userId, asset)));
    }
    async cryptoWithdraw(userId, dto, context) {
        await this.assertIdempotency(userId, dto.idempotencyKey);
        const fee = this.calculateCryptoWithdrawFee(dto.amount);
        const riskScore = this.fraudLogService.computeRiskScore({
            amount: dto.amount * 100,
            dailyVolume: await this.getDailyVolume(userId),
        });
        await this.fraudLogService.log(userId, 'CRYPTO_WITHDRAW_INIT', riskScore, {
            ...context,
            details: { asset: dto.asset, amount: dto.amount, destination: dto.destinationAddress },
        });
        if (riskScore >= 90) {
            throw new common_1.ForbiddenException('Crypto withdrawal blocked for security review');
        }
        const transaction = await this.prisma.walletTransaction.create({
            data: {
                userId,
                type: 'WITHDRAWAL',
                status: 'PROCESSING',
                amount: 0,
                fee,
                netAmount: 0,
                currency: 'USD',
                cryptoAsset: dto.asset,
                cryptoAmount: dto.amount,
                provider: this.coinbaseService.isConfigured() ? 'COINBASE' : 'INTERNAL',
                description: `Crypto withdrawal ${dto.asset}`,
                idempotencyKey: dto.idempotencyKey,
                metadata: { destinationAddress: dto.destinationAddress },
            },
        });
        const completed = await this.prisma.walletTransaction.update({
            where: { id: transaction.id },
            data: { status: 'COMPLETED', completedAt: new Date() },
        });
        await this.walletCache.invalidateUser(userId);
        return this.toTransactionDto(completed);
    }
    async completeStripeDeposit(paymentIntentId, userId) {
        const pending = await this.prisma.walletTransaction.findFirst({
            where: {
                providerReferenceId: paymentIntentId,
                userId,
                type: 'DEPOSIT',
                status: 'PENDING',
            },
        });
        if (!pending) {
            return;
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.walletTransaction.update({
                where: { id: pending.id },
                data: { status: 'COMPLETED', completedAt: new Date() },
            });
            await tx.fiatWallet.update({
                where: { userId },
                data: { availableBalance: { increment: pending.netAmount } },
            });
        });
        await this.walletCache.invalidateUser(userId);
        void this.notifyPaymentReceived(userId, pending);
    }
    notifyPaymentReceived(userId, transaction) {
        void this.notificationsService.notify({
            userId,
            type: 'PAYMENT_RECEIVED',
            title: 'Payment received',
            body: `${transaction.currency} ${this.decimalToNumber(transaction.netAmount).toFixed(2)} added to your wallet`,
            entityId: transaction.id,
            dedupeKey: `payment:${transaction.id}`,
            data: {
                transactionId: transaction.id,
                amount: this.decimalToNumber(transaction.netAmount),
                currency: transaction.currency,
            },
        });
    }
    async ensureFiatWallet(userId) {
        return this.prisma.fiatWallet.upsert({
            where: { userId },
            create: { userId },
            update: {},
        });
    }
    async ensureFiatWalletInTx(tx, userId) {
        const existing = await tx.fiatWallet.findUnique({ where: { userId } });
        if (existing) {
            return existing;
        }
        return tx.fiatWallet.create({ data: { userId } });
    }
    async creditFiatWallet(userId, amount) {
        await this.ensureFiatWallet(userId);
        await this.prisma.fiatWallet.update({
            where: { userId },
            data: { availableBalance: { increment: amount } },
        });
    }
    async assertIdempotency(userId, key) {
        if (!key) {
            return;
        }
        const existing = await this.prisma.walletTransaction.findUnique({
            where: { idempotencyKey: key },
        });
        if (existing && existing.userId === userId) {
            throw new common_1.BadRequestException('Duplicate idempotency key');
        }
    }
    async getDailyVolume(userId) {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const aggregate = await this.prisma.walletTransaction.aggregate({
            where: {
                userId,
                createdAt: { gte: since },
                status: { in: ['COMPLETED', 'PROCESSING', 'PENDING'] },
            },
            _sum: { amount: true },
        });
        return this.decimalToNumber(aggregate._sum.amount ?? 0);
    }
    calculateDepositFee(amount) {
        const percent = this.configService.get('wallet.depositFeePercent', 2.5);
        return Math.round(amount * (percent / 100) * 100) / 100;
    }
    calculateWithdrawFee(amount) {
        const flat = this.configService.get('wallet.withdrawFeeFlat', 1);
        const percent = this.configService.get('wallet.withdrawFeePercent', 1);
        return Math.round((flat + amount * (percent / 100)) * 100) / 100;
    }
    calculateTransferFee(amount) {
        const percent = this.configService.get('wallet.transferFeePercent', 0.5);
        return Math.round(amount * (percent / 100) * 100) / 100;
    }
    calculateCryptoWithdrawFee(amount) {
        const flat = this.configService.get('wallet.cryptoWithdrawFeeFlat', 2);
        return flat + Math.round(amount * 0.01 * 100) / 100;
    }
    decimalToNumber(value) {
        if (value === null || value === undefined) {
            return 0;
        }
        return typeof value === 'number' ? value : value.toNumber();
    }
    toTransactionDto(row) {
        return {
            id: row.id,
            type: row.type,
            status: row.status,
            amount: this.decimalToNumber(row.amount),
            fee: this.decimalToNumber(row.fee),
            netAmount: this.decimalToNumber(row.netAmount),
            currency: row.currency,
            cryptoAsset: row.cryptoAsset,
            cryptoAmount: row.cryptoAmount ? this.decimalToNumber(row.cryptoAmount) : null,
            description: row.description,
            counterpartyUserId: row.counterpartyUserId,
            createdAt: row.createdAt.toISOString(),
            completedAt: row.completedAt?.toISOString() ?? null,
        };
    }
    toBankAccountDto(account, verificationCode) {
        const dto = {
            id: account.id,
            bankName: account.bankName,
            accountHolderName: account.accountHolderName,
            country: account.country,
            last4: account.last4,
            isDefault: account.isDefault,
            status: account.status,
            verifiedAt: account.verifiedAt?.toISOString() ?? null,
            createdAt: account.createdAt.toISOString(),
        };
        if (verificationCode) {
            dto.verificationCode = verificationCode;
        }
        return dto;
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        encryption_service_1.EncryptionService,
        fraud_log_service_1.FraudLogService,
        wallet_cache_service_1.WalletCacheService,
        stripe_service_1.StripeService,
        coinbase_service_1.CoinbaseCommerceService,
        notifications_service_1.NotificationsService,
        config_1.ConfigService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map