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
exports.FraudDetectionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../database/prisma.service");
const rate_limiter_service_1 = require("../redis/rate-limiter.service");
const fraud_log_service_1 = require("../wallet/fraud-log.service");
const DISPOSABLE_EMAIL_DOMAINS = new Set([
    'mailinator.com',
    'guerrillamail.com',
    'tempmail.com',
    '10minutemail.com',
    'trashmail.com',
    'yopmail.com',
]);
const AUTO_BAN_SCORE = 95;
const BLOCK_ACTION_SCORE = 75;
let FraudDetectionService = class FraudDetectionService {
    prisma;
    rateLimiter;
    fraudLogService;
    configService;
    constructor(prisma, rateLimiter, fraudLogService, configService) {
        this.prisma = prisma;
        this.rateLimiter = rateLimiter;
        this.fraudLogService = fraudLogService;
        this.configService = configService;
    }
    async assertRegistrationAllowed(email, phoneNumber, context) {
        let score = 0;
        const ip = context.ipAddress ?? 'unknown';
        const hourlyLimit = this.configService.get('security.registerIpHourlyLimit', 3);
        const ipLimit = await this.rateLimiter.consume('register-ip', ip, hourlyLimit, 3600);
        if (!ipLimit.allowed) {
            score += 70;
        }
        else if (ipLimit.count >= hourlyLimit) {
            score += 40;
        }
        const domain = email?.split('@')[1]?.toLowerCase();
        if (domain && DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
            score += 50;
        }
        const recentSamePhone = phoneNumber
            ? await this.prisma.user.count({
                where: {
                    phoneNumber,
                    createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                },
            })
            : 0;
        if (recentSamePhone > 0) {
            score += 40;
        }
        if (score >= BLOCK_ACTION_SCORE) {
            throw new common_1.ForbiddenException('Registration temporarily blocked by fraud controls');
        }
    }
    async inspectNewAccount(userId, context) {
        const ip = context.ipAddress ?? 'unknown';
        const ipLimit = await this.rateLimiter.consume('register-ip-log', ip, 1000, 3600);
        const score = ipLimit.count >= 3 ? 45 : 10;
        await this.record(userId, 'FAKE_ACCOUNT_SIGNAL', score, context, {
            registrationsFromIp: ipLimit.count,
        });
    }
    async assertMeetupCreateAllowed(userId, context = {}) {
        const daily = await this.rateLimiter.consume('meetup-create', userId, 8, 86_400);
        if (!daily.allowed) {
            throw new common_1.ForbiddenException('Daily meetup create limit reached');
        }
        const user = await this.prisma.user.findUniqueOrThrow({
            where: { id: userId },
            select: { createdAt: true },
        });
        const ageHours = (Date.now() - user.createdAt.getTime()) / (60 * 60 * 1000);
        let score = 0;
        if (ageHours < 24 && daily.count >= 3) {
            score += 55;
        }
        if (daily.count >= 6) {
            score += 25;
        }
        if (score >= 40) {
            await this.record(userId, 'FAKE_MEETUP_SIGNAL', score, context, {
                createsToday: daily.count,
                ageHours: Math.round(ageHours),
            });
        }
        if (score >= BLOCK_ACTION_SCORE) {
            throw new common_1.ForbiddenException('Meetup creation blocked by fraud controls');
        }
    }
    async assertReviewAllowed(reviewerId, reviewedId, rating, context = {}) {
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const [outgoing, incoming] = await Promise.all([
            this.prisma.meetupReview.count({
                where: { reviewerId, reviewedId, createdAt: { gte: since } },
            }),
            this.prisma.meetupReview.count({
                where: { reviewerId: reviewedId, reviewedId: reviewerId, createdAt: { gte: since } },
            }),
        ]);
        let score = 0;
        if (outgoing >= 2) {
            score += 40;
        }
        if (rating === 5 && incoming >= 1) {
            score += 45;
        }
        if (rating === 5 && outgoing >= 1 && incoming >= 1) {
            score += 30;
        }
        const recentFives = await this.prisma.meetupReview.count({
            where: {
                reviewerId,
                rating: 5,
                createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
            },
        });
        if (recentFives >= 3) {
            score += 35;
        }
        if (score >= 30) {
            await this.record(reviewerId, 'RATING_MANIPULATION', Math.min(score, 100), context, {
                reviewedId,
                rating,
                outgoing,
                incoming,
                recentFives,
            });
        }
        if (score >= BLOCK_ACTION_SCORE) {
            throw new common_1.ForbiddenException('Review blocked by fraud controls');
        }
    }
    async maybeSuspend(userId, score) {
        if (score < AUTO_BAN_SCORE) {
            return;
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                isActive: false,
                tokenVersion: { increment: 1 },
            },
        });
        await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }
    async record(userId, action, riskScore, context, details) {
        await this.fraudLogService.log(userId, action, riskScore, {
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            details,
        });
        await this.maybeSuspend(userId, riskScore);
    }
};
exports.FraudDetectionService = FraudDetectionService;
exports.FraudDetectionService = FraudDetectionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        rate_limiter_service_1.RateLimiterService,
        fraud_log_service_1.FraudLogService,
        config_1.ConfigService])
], FraudDetectionService);
//# sourceMappingURL=fraud-detection.service.js.map