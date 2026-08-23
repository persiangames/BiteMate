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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscrowService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../database/prisma.service");
const fraud_log_service_1 = require("./fraud-log.service");
const wallet_cache_service_1 = require("./wallet-cache.service");
let EscrowService = class EscrowService {
    prisma;
    fraudLogService;
    walletCache;
    configService;
    constructor(prisma, fraudLogService, walletCache, configService) {
        this.prisma = prisma;
        this.fraudLogService = fraudLogService;
        this.walletCache = walletCache;
        this.configService = configService;
    }
    async createHold(payerId, dto, context) {
        if (payerId === dto.payeeId) {
            throw new common_1.BadRequestException('Cannot escrow to yourself');
        }
        const payee = await this.prisma.user.findFirst({
            where: { id: dto.payeeId, isActive: true },
        });
        if (!payee) {
            throw new common_1.NotFoundException('Payee not found');
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
                throw new common_1.BadRequestException('Insufficient balance for escrow hold');
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
    async releaseEscrow(actorId, escrowId, dto) {
        const escrow = await this.getEscrow(escrowId);
        if (escrow.status !== 'HELD') {
            throw new common_1.BadRequestException('Escrow is not held');
        }
        const isPayer = escrow.payerId === actorId;
        const isPayee = escrow.payeeId === actorId;
        if (!isPayer && !isPayee) {
            throw new common_1.ForbiddenException('Not authorized to release this escrow');
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
    async refundEscrow(actorId, escrowId) {
        const escrow = await this.getEscrow(escrowId);
        if (escrow.status !== 'HELD') {
            throw new common_1.BadRequestException('Escrow is not held');
        }
        if (escrow.payerId !== actorId && escrow.payeeId !== actorId) {
            throw new common_1.ForbiddenException('Not authorized');
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
    async getEscrow(escrowId) {
        const escrow = await this.prisma.escrowHold.findUnique({ where: { id: escrowId } });
        if (!escrow) {
            throw new common_1.NotFoundException('Escrow not found');
        }
        return escrow;
    }
    calculateEscrowFee(amount) {
        const percent = this.configService.get('wallet.escrowFeePercent', 1.5);
        return Math.round(amount * (percent / 100) * 100) / 100;
    }
    decimalToNumber(value) {
        return typeof value === 'number' ? value : value.toNumber();
    }
    toEscrowDto(escrow) {
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
};
exports.EscrowService = EscrowService;
exports.EscrowService = EscrowService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        fraud_log_service_1.FraudLogService,
        wallet_cache_service_1.WalletCacheService,
        config_1.ConfigService])
], EscrowService);
//# sourceMappingURL=escrow.service.js.map