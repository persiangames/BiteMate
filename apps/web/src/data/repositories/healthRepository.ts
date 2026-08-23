import type { HealthResponseDto } from '@bitemate/shared';
import { apiFetch } from '@/data/api/client';

export async function fetchHealthStatus(): Promise<HealthResponseDto> {
  return apiFetch<HealthResponseDto>('/health');
}
