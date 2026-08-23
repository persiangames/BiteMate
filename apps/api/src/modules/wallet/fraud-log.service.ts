import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

export interface FraudContext {
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

@Injectable()
export class FraudLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    userId: string,
    action: string,
    riskScore: number,
    context: FraudContext = {},
  ): Promise<void> {
    await this.prisma.fraudLog.create({
      data: {
        userId,
        action,
        riskScore,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        details: context.details as Prisma.InputJsonValue | undefined,
      },
    });
  }

  computeRiskScore(params: {
    amount: number;
    dailyVolume: number;
    isNewBankAccount?: boolean;
    velocityCount?: number;
  }): number {
    let score = 0;
    if (params.amount >= 1000) score += 30;
    if (params.amount >= 5000) score += 40;
    if (params.dailyVolume >= 2000) score += 20;
    if (params.isNewBankAccount) score += 25;
    if ((params.velocityCount ?? 0) >= 5) score += 35;
    return Math.min(score, 100);
  }
}
