import type { HealthResponseDto } from '@bitemate/shared';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
export interface ReadinessResponseDto {
    status: 'ok';
    database: 'ok';
    redis: 'ok';
}
export declare class HealthService {
    private readonly prisma;
    private readonly redis;
    constructor(prisma: PrismaService, redis: RedisService);
    check(): HealthResponseDto;
    readiness(): Promise<ReadinessResponseDto>;
}
