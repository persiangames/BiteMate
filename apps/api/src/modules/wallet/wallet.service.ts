import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  BankAccountDto,
  CryptoAddressDto,
  CryptoAsset,
  DepositResponseDto,
  WalletBalanceResponseDto,
  WalletTransactionDto,
  WalletTransactionsResponseDto,
} from '@bitemate/shared';
import type { FiatWallet, Prisma, WalletTransaction } from '@prisma/client';
import { randomInt } from 'node:crypto';
import QRCode from 'qrcode';
import { PrismaService } from '../database/prisma.service';
import { CoinbaseCommerceService } from './coinbase.service';
import { EncryptionService } from './encryption.service';
import { FraudContext, FraudLogService } from './fraud-log.service';
import { StripeService } from './stripe.service';
import { WalletCacheService } from './wallet-cache.service';
import type {
  CreateBankAccountDto,
  CryptoWithdrawDto,
  DepositDto,
  TransferDto,
  VerifyBankAccountDto,
  WithdrawDto,
} from './dto/wallet.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { isProductionEnv } from '../../common/utils/environment.util';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
    private readonly fraudLogService: FraudLogService,
    private readonly walletCache: WalletCacheService,
    private readonly stripeService: StripeService,
    private readonly coinbaseService: CoinbaseCommerceService,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  async getBalance(userId: string): Promise<WalletBalanceResponseDto> {
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

    const balance: WalletBalanceResponseDto = {
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

  async deposit(
    userId: string,
    dto: DepositDto,
    context: FraudContext,
  ): Promise<DepositResponseDto> {
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
      throw new ForbiddenException('Deposit blocked for security review');
    }

    const stripe = await this.stripeService.createDepositIntent({
      amountCents: Math.round(dto.amount * 100),
      currency,
      userId,
    });

    if (stripe.mock && isProductionEnv(this.configService.get<string>('app.nodeEnv'))) {
      throw new ServiceUnavailableException('Card deposits require Stripe in production');
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

  async withdraw(
    userId: string,
    dto: WithdrawDto,
    context: FraudContext,
  ): Promise<WalletTransactionDto> {
    await this.assertIdempotency(userId, dto.idempotencyKey);

    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: { id: dto.bankAccountId, userId },
    });
    if (!bankAccount) {
      throw new NotFoundException('Bank account not found');
    }
    if (bankAccount.status !== 'VERIFIED') {
      throw new BadRequestException('Bank account must be verified before withdrawal');
    }

    const wallet = await this.ensureFiatWallet(userId);
    const fee = this.calculateWithdrawFee(dto.amount);
    const totalDebit = dto.amount + fee;
    const available = this.decimalToNumber(wallet.availableBalance);

    if (available < totalDebit) {
      throw new BadRequestException('Insufficient available balance');
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
      throw new ForbiddenException('Withdrawal blocked for security review');
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

  async transfer(
    userId: string,
    dto: TransferDto,
    context: FraudContext,
  ): Promise<WalletTransactionDto> {
    if (userId === dto.recipientUserId) {
      throw new BadRequestException('Cannot transfer to yourself');
    }

    await this.assertIdempotency(userId, dto.idempotencyKey);

    const recipient = await this.prisma.user.findFirst({
      where: { id: dto.recipientUserId, isActive: true },
    });
    if (!recipient) {
      throw new NotFoundException('Recipient not found');
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
        throw new BadRequestException('Insufficient available balance');
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

  async listTransactions(
    userId: string,
    cursor?: string,
    limit = 30,
  ): Promise<WalletTransactionsResponseDto> {
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

  async addBankAccount(userId: string, dto: CreateBankAccountDto): Promise<BankAccountDto> {
    const last4 = dto.accountNumber.slice(-4);
    const verificationCode = randomInt(100000, 999999).toString();

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

  async listBankAccounts(userId: string): Promise<BankAccountDto[]> {
    const accounts = await this.prisma.bankAccount.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return accounts.map((account) => this.toBankAccountDto(account));
  }

  async verifyBankAccount(
    userId: string,
    bankAccountId: string,
    dto: VerifyBankAccountDto,
  ): Promise<BankAccountDto> {
    const account = await this.prisma.bankAccount.findFirst({
      where: { id: bankAccountId, userId },
    });
    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    const hash = this.encryptionService.hash(dto.verificationCode);
    if (account.verificationTokenHash !== hash) {
      await this.fraudLogService.log(userId, 'BANK_VERIFY_FAILED', 40, {
        details: { bankAccountId },
      });
      throw new BadRequestException('Invalid verification code');
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

  async setDefaultBankAccount(userId: string, bankAccountId: string): Promise<BankAccountDto> {
    const account = await this.prisma.bankAccount.findFirst({
      where: { id: bankAccountId, userId, status: 'VERIFIED' },
    });
    if (!account) {
      throw new NotFoundException('Verified bank account not found');
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

  async getOrCreateCryptoAddress(userId: string, asset: CryptoAsset): Promise<CryptoAddressDto> {
    let entry = await this.prisma.cryptoDepositAddress.findUnique({
      where: { userId_asset: { userId, asset } },
    });

    if (!entry) {
      const address = this.coinbaseService.generateMockAddress(userId, asset);
      entry = await this.prisma.cryptoDepositAddress.create({
        data: { userId, asset, address },
      });
    }

    const qrCodeDataUrl = await QRCode.toDataURL(entry.address, { width: 256, margin: 1 });
    return { asset: entry.asset, address: entry.address, qrCodeDataUrl };
  }

  async listCryptoAddresses(userId: string): Promise<CryptoAddressDto[]> {
    const assets: CryptoAsset[] = ['BTC', 'ETH', 'USDT', 'USDC', 'DOGE', 'SOL'];
    return Promise.all(assets.map((asset) => this.getOrCreateCryptoAddress(userId, asset)));
  }

  async cryptoWithdraw(
    userId: string,
    dto: CryptoWithdrawDto,
    context: FraudContext,
  ): Promise<WalletTransactionDto> {
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
      throw new ForbiddenException('Crypto withdrawal blocked for security review');
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

  async completeStripeDeposit(paymentIntentId: string, userId: string): Promise<void> {
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

  private notifyPaymentReceived(userId: string, transaction: WalletTransaction): void {
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

  private async ensureFiatWallet(userId: string): Promise<FiatWallet> {
    return this.prisma.fiatWallet.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  private async ensureFiatWalletInTx(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<FiatWallet> {
    const existing = await tx.fiatWallet.findUnique({ where: { userId } });
    if (existing) {
      return existing;
    }
    return tx.fiatWallet.create({ data: { userId } });
  }

  private async creditFiatWallet(userId: string, amount: number): Promise<void> {
    await this.ensureFiatWallet(userId);
    await this.prisma.fiatWallet.update({
      where: { userId },
      data: { availableBalance: { increment: amount } },
    });
  }

  private async assertIdempotency(userId: string, key?: string): Promise<void> {
    if (!key) {
      return;
    }
    const existing = await this.prisma.walletTransaction.findUnique({
      where: { idempotencyKey: key },
    });
    if (existing && existing.userId === userId) {
      throw new BadRequestException('Duplicate idempotency key');
    }
  }

  private async getDailyVolume(userId: string): Promise<number> {
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

  private calculateDepositFee(amount: number): number {
    const percent = this.configService.get<number>('wallet.depositFeePercent', 2.5)!;
    return Math.round(amount * (percent / 100) * 100) / 100;
  }

  private calculateWithdrawFee(amount: number): number {
    const flat = this.configService.get<number>('wallet.withdrawFeeFlat', 1)!;
    const percent = this.configService.get<number>('wallet.withdrawFeePercent', 1)!;
    return Math.round((flat + amount * (percent / 100)) * 100) / 100;
  }

  private calculateTransferFee(amount: number): number {
    const percent = this.configService.get<number>('wallet.transferFeePercent', 0.5)!;
    return Math.round(amount * (percent / 100) * 100) / 100;
  }

  private calculateCryptoWithdrawFee(amount: number): number {
    const flat = this.configService.get<number>('wallet.cryptoWithdrawFeeFlat', 2)!;
    return flat + Math.round(amount * 0.01 * 100) / 100;
  }

  private decimalToNumber(value: Prisma.Decimal | number | null | undefined): number {
    if (value === null || value === undefined) {
      return 0;
    }
    return typeof value === 'number' ? value : value.toNumber();
  }

  private toTransactionDto(row: WalletTransaction): WalletTransactionDto {
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

  private toBankAccountDto(
    account: {
      id: string;
      bankName: string;
      accountHolderName: string;
      country: string;
      last4: string;
      isDefault: boolean;
      status: BankAccountDto['status'];
      verifiedAt: Date | null;
      createdAt: Date;
    },
    verificationCode?: string,
  ): BankAccountDto {
    const dto: BankAccountDto & { verificationCode?: string } = {
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
}
