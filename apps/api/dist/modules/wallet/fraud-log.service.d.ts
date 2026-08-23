import { PrismaService } from '../database/prisma.service';
export interface FraudContext {
    ipAddress?: string;
    userAgent?: string;
    details?: Record<string, unknown>;
}
export declare class FraudLogService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    log(userId: string, action: string, riskScore: number, context?: FraudContext): Promise<void>;
    computeRiskScore(params: {
        amount: number;
        dailyVolume: number;
        isNewBankAccount?: boolean;
        velocityCount?: number;
    }): number;
}
