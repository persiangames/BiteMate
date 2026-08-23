import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { HealthResponseDto } from '@bitemate/shared';
import { Public } from '../../common/decorators/auth.decorators';
import { HealthService, type ReadinessResponseDto } from './health.service';

@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  check(): HealthResponseDto {
    return this.healthService.check();
  }

  @Public()
  @Get('ready')
  readiness(): Promise<ReadinessResponseDto> {
    return this.healthService.readiness();
  }
}
