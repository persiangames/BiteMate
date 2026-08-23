import type { HealthResponseDto } from '@bitemate/shared';
import { HealthService, type ReadinessResponseDto } from './health.service';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    check(): HealthResponseDto;
    readiness(): Promise<ReadinessResponseDto>;
}
