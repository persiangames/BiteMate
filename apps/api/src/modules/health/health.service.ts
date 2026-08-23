import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { HealthResponseDto } from '@bitemate/shared';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';

export interface ReadinessResponseDto {
  status: 'ok';
  database: 'ok';
  redis: 'ok';
}

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  check(): HealthResponseDto {
    return { status: 'ok' };
  }

  async readiness(): Promise<ReadinessResponseDto> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const redisPing = await this.redis.ping();

      if (redisPing !== 'PONG') {
        throw new Error('Redis ping failed');
      }

      return {
        status: 'ok',
        database: 'ok',
        redis: 'ok',
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'error',
        redis: 'error',
      });
    }
  }
}
