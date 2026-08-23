import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EscrowHoldDto } from '@bitemate/shared';
import type { EscrowHold, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { FraudContext, FraudLogService } from './fraud-log.service';
import { WalletCacheService } from './wallet-cache.service';
import type { CreateEscrowDto, ReleaseEscrowDto } from './dto/wallet.dto';

@Injectable()
export class EscrowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fraudLogService: FraudLogService,
    private readonly walletCache: WalletCacheService,
    private readonly configService: ConfigService,
  ) {}

  async createHold(
    payerId: string,
    dto: CreateEscrowDto,
    context: FraudContext,
  ): Promise<EscrowHoldDto> {
    if (payerId === dto.payeeId) {
      throw new BadRequestException('Cannot escrow to yourself');
    }

    const payee = await this.prisma.user.findFirst({
      where: { id: dto.payeeId, isActive: true },
    });
    if (!payee) {
      throw new NotFoundException('Payee not found');
    }

    const fee = this.calculateEscrowFee(dto.amount);
    const total = dto.amount + fee;

    await this.fraudLogService.log(payerId, 'ESCROW_HOLD', 20, {
      ...context,
      details: { payeeId: dto.payeeId, amount: dto.amount, referenceId: dto.referenceId },
    });

    const hold = await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.fiatWallet.findUnique({ where: { userId: payerId } });
      const available = wallet ? this.decimalToNumber(wallet.availableBalance) : 0;
      if (available < total) {
        throw new BadRequestException('Insufficient balance for escrow hold');
      }

      await tx.fiatWallet.update({
        where: { userId: payerId },
        data: {
          availableBalance: { decrement: total },
          pendingBalance: { increment: dto.amount },
        },
      });

      const escrow = await tx.escrowHold.create({
        data: {
          payerId,
          payeeId: dto.payeeId,
          amount: dto.amount,
          fee,
          referenceType: dto.referenceType,
          referenceId: dto.referenceId,
          releaseNote: dto.note,
        },
      });

      await tx.walletTransaction.create({
        data: {
          userId: payerId,
          type: 'ESCROW_HOLD',
          status: 'COMPLETED',
          amount: dto.amount,
          fee,
          netAmount: dto.amount,
          currency: 'USD',
          provider: 'INTERNAL',
          escrowId: escrow.id,
          description: `Escrow hold · ${dto.referenceType}`,
          completedAt: new Date(),
        },
      });

      return escrow;
    });

    await this.walletCache.invalidateUser(payerId);
    return this.toEscrowDto(hold);
  }

  async releaseEscrow(
    actorId: string,
    escrowId: string,
    dto: ReleaseEscrowDto,
  ): Promise<EscrowHoldDto> {
    const escrow = await this.getEscrow(escrowId);
    if (escrow.status !== 'HELD') {
      throw new BadRequestException('Escrow is not held');
    }

    const isPayer = escrow.payerId === actorId;
    const isPayee = escrow.payeeId === actorId;
    if (!isPayer && !isPayee) {
      throw new ForbiddenException('Not authorized to release this escrow');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.fiatWallet.update({
        where: { userId: escrow.payerId },
        data: { pendingBalance: { decrement: escrow.amount } },
      });

      await tx.fiatWallet.upsert({
        where: { userId: escrow.payeeId },
        create: { userId: escrow.payeeId, availableBalance: escrow.amount },
        update: { availableBalance: { increment: escrow.amount } },
      });

      const saved = await tx.escrowHold.update({
        where: { id: escrowId },
        data: {
          status: 'RELEASED',
          releasedAt: new Date(),
          releaseNote: dto.releaseNote ?? escrow.releaseNote,
        },
      });

      await tx.walletTransaction.create({
        data: {
          userId: escrow.payeeId,
          type: 'ESCROW_RELEASE',
          status: 'COMPLETED',
          amount: this.decimalToNumber(escrow.amount),
          fee: 0,
          netAmount: this.decimalToNumber(escrow.amount),
          currency: escrow.currency,
          provider: 'INTERNAL',
          escrowId: escrow.id,
          counterpartyUserId: escrow.payerId,
          description: 'Escrow released',
          completedAt: new Date(),
        },
      });

      return saved;
    });

    await this.walletCache.invalidateUser(escrow.payerId);
    await this.walletCache.invalidateUser(escrow.payeeId);
    return this.toEscrowDto(updated);
  }

  async refundEscrow(actorId: string, escrowId: string): Promise<EscrowHoldDto> {
    const escrow = await this.getEscrow(escrowId);
    if (escrow.status !== 'HELD') {
      throw new BadRequestException('Escrow is not held');
    }
    if (escrow.payerId !== actorId && escrow.payeeId !== actorId) {
      throw new ForbiddenException('Not authorized');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.fiatWallet.update({
        where: { userId: escrow.payerId },
        data: {
          pendingBalance: { decrement: escrow.amount },
          availableBalance: { increment: escrow.amount },
        },
      });

      const saved = await tx.escrowHold.update({
        where: { id: escrowId },
        data: { status: 'REFUNDED', releasedAt: new Date() },
      });

      await tx.walletTransaction.create({
        data: {
          userId: escrow.payerId,
          type: 'ESCROW_REFUND',
          status: 'COMPLETED',
          amount: this.decimalToNumber(escrow.amount),
          fee: 0,
          netAmount: this.decimalToNumber(escrow.amount),
          currency: escrow.currency,
          provider: 'INTERNAL',
          escrowId: escrow.id,
          description: 'Escrow refunded',
          completedAt: new Date(),
        },
      });

      return saved;
    });

    await this.walletCache.invalidateUser(escrow.payerId);
    return this.toEscrowDto(updated);
  }

  private async getEscrow(escrowId: string): Promise<EscrowHold> {
    const escrow = await this.prisma.escrowHold.findUnique({ where: { id: escrowId } });
    if (!escrow) {
      throw new NotFoundException('Escrow not found');
    }
    return escrow;
  }

  private calculateEscrowFee(amount: number): number {
    const percent = this.configService.get<number>('wallet.escrowFeePercent', 1.5)!;
    return Math.round(amount * (percent / 100) * 100) / 100;
  }

  private decimalToNumber(value: Prisma.Decimal | number): number {
    return typeof value === 'number' ? value : value.toNumber();
  }

  private toEscrowDto(escrow: EscrowHold): EscrowHoldDto {
    return {
      id: escrow.id,
      payerId: escrow.payerId,
      payeeId: escrow.payeeId,
      amount: this.decimalToNumber(escrow.amount),
      fee: this.decimalToNumber(escrow.fee),
      currency: escrow.currency,
      status: escrow.status,
      referenceType: escrow.referenceType,
      referenceId: escrow.referenceId,
      heldAt: escrow.heldAt.toISOString(),
      releasedAt: escrow.releasedAt?.toISOString() ?? null,
    };
  }
}
