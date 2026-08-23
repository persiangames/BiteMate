import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { RateLimiterService } from '../redis/rate-limiter.service';
import { FraudLogService } from '../wallet/fraud-log.service';
export interface SecurityContext {
    ipAddress?: string;
    userAgent?: string;
}
export declare class FraudDetectionService {
    private readonly prisma;
    private readonly rateLimiter;
    private readonly fraudLogService;
    private readonly configService;
    constructor(prisma: PrismaService, rateLimiter: RateLimiterService, fraudLogService: FraudLogService, configService: ConfigService);
    assertRegistrationAllowed(email: string | undefined, phoneNumber: string | undefined, context: SecurityContext): Promise<void>;
    inspectNewAccount(userId: string, context: SecurityContext): Promise<void>;
    assertMeetupCreateAllowed(userId: string, context?: SecurityContext): Promise<void>;
    assertReviewAllowed(reviewerId: string, reviewedId: string, rating: number, context?: SecurityContext): Promise<void>;
    maybeSuspend(userId: string, score: number): Promise<void>;
    private record;
}
