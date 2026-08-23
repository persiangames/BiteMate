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
exports.FraudLogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let FraudLogService = class FraudLogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(userId, action, riskScore, context = {}) {
        await this.prisma.fraudLog.create({
            data: {
                userId,
                action,
                riskScore,
                ipAddress: context.ipAddress,
                userAgent: context.userAgent,
                details: context.details,
            },
        });
    }
    computeRiskScore(params) {
        let score = 0;
        if (params.amount >= 1000)
            score += 30;
        if (params.amount >= 5000)
            score += 40;
        if (params.dailyVolume >= 2000)
            score += 20;
        if (params.isNewBankAccount)
            score += 25;
        if ((params.velocityCount ?? 0) >= 5)
            score += 35;
        return Math.min(score, 100);
    }
};
exports.FraudLogService = FraudLogService;
exports.FraudLogService = FraudLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FraudLogService);
//# sourceMappingURL=fraud-log.service.js.map