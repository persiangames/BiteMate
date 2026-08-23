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
exports.PremiumService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../database/prisma.service");
const fraud_log_service_1 = require("../wallet/fraud-log.service");
let PremiumService = class PremiumService {
    prisma;
    configService;
    fraudLogService;
    constructor(prisma, configService, fraudLogService) {
        this.prisma = prisma;
        this.configService = configService;
        this.fraudLogService = fraudLogService;
    }
    async getStatus(userId) {
        await this.syncExpiredPremium(userId);
        const user = await this.prisma.user.findUniqueOrThrow({
            where: { id: userId },
            select: { isPremium: true, premiumExpiresAt: true },
        });
        const activeSub = await this.prisma.premiumSubscription.findFirst({
            where: { userId, status: 'ACTIVE', expiresAt: { gt: new Date() } },
            orderBy: { expiresAt: 'desc' },
        });
        return {
            isPremium: this.isPremiumActive(user),
            expiresAt: user.premiumExpiresAt?.toISOString() ?? null,
            planId: activeSub?.planId ?? null,
            benefits: this.getBenefits(),
        };
    }
    async subscribe(userId, dto) {
        const amount = this.configService.get('premium.monthlyPrice', 9.99);
        const currency = 'USD';
        const durationDays = this.configService.get('premium.durationDays', 30);
        await this.fraudLogService.log(userId, 'PREMIUM_SUBSCRIBE', 5, {
            details: { amount, paymentMethod: dto.paymentMethod ?? 'WALLET' },
        });
        const paymentMethod = dto.paymentMethod ?? 'WALLET';
        const subscription = await this.prisma.$transaction(async (tx) => {
            if (paymentMethod === 'WALLET') {
                await tx.fiatWallet.upsert({
                    where: { userId },
                    create: { userId },
                    update: {},
                });
                const wallet = await tx.fiatWallet.findUniqueOrThrow({ where: { userId } });
                const available = wallet.availableBalance.toNumber();
                if (available < amount) {
                    throw new common_1.BadRequestException('Insufficient wallet balance for premium subscription');
                }
                await tx.fiatWallet.update({
                    where: { userId },
                    data: { availableBalance: { decrement: amount } },
                });
                await tx.walletTransaction.create({
                    data: {
                        userId,
                        type: 'WITHDRAWAL',
                        status: 'COMPLETED',
                        amount,
                        fee: 0,
                        netAmount: amount,
                        currency,
                        provider: 'INTERNAL',
                        description: 'Premium monthly subscription',
                        idempotencyKey: dto.idempotencyKey,
                        completedAt: new Date(),
                    },
                });
            }
            const user = await tx.user.findUniqueOrThrow({
                where: { id: userId },
                select: { premiumExpiresAt: true },
            });
            const baseDate = user.premiumExpiresAt && user.premiumExpiresAt > new Date()
                ? user.premiumExpiresAt
                : new Date();
            const expiresAt = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
            await tx.user.update({
                where: { id: userId },
                data: { isPremium: true, premiumExpiresAt: expiresAt },
            });
            return tx.premiumSubscription.create({
                data: {
                    userId,
                    status: 'ACTIVE',
                    amount,
                    currency,
                    expiresAt,
                    providerReferenceId: dto.idempotencyKey,
                },
            });
        });
        return {
            subscriptionId: subscription.id,
            isPremium: true,
            expiresAt: subscription.expiresAt.toISOString(),
            amount,
            currency,
        };
    }
    async resolvePremium(userId) {
        await this.syncExpiredPremium(userId);
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { isPremium: true, premiumExpiresAt: true },
        });
        return user ? this.isPremiumActive(user) : false;
    }
    isPremiumActive(user) {
        if (!user.isPremium) {
            return false;
        }
        if (!user.premiumExpiresAt) {
            return true;
        }
        return user.premiumExpiresAt > new Date();
    }
    getBenefits() {
        const premiumLimit = this.configService.get('meetup.premiumDailyInviteLimit', 9999);
        return {
            dailyInviteLimit: premiumLimit,
            unlimitedInvites: premiumLimit >= 9999,
            visibilityBoost: this.configService.get('premium.visibilityBoost', 5),
            priorityRankingBoost: this.configService.get('premium.priorityRankingBoost', 10),
            priorityMatchingBoost: this.configService.get('premium.visibilityBoost', 5),
            removeLimits: true,
        };
    }
    async syncExpiredPremium(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { isPremium: true, premiumExpiresAt: true },
        });
        if (!user?.isPremium || !user.premiumExpiresAt) {
            return;
        }
        if (user.premiumExpiresAt <= new Date()) {
            await this.prisma.$transaction([
                this.prisma.user.update({
                    where: { id: userId },
                    data: { isPremium: false },
                }),
                this.prisma.premiumSubscription.updateMany({
                    where: { userId, status: 'ACTIVE', expiresAt: { lte: new Date() } },
                    data: { status: 'EXPIRED' },
                }),
            ]);
        }
    }
};
exports.PremiumService = PremiumService;
exports.PremiumService = PremiumService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        fraud_log_service_1.FraudLogService])
], PremiumService);
//# sourceMappingURL=premium.service.js.map