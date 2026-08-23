jest.mock('../database/prisma.service', () => ({
  PrismaService: jest.fn(),
}));

jest.mock('../redis/redis.service', () => ({
  RedisService: jest.fn(),
}));

import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: jest.Mocked<Pick<HealthService, 'check' | 'readiness'>>;

  beforeEach(() => {
    healthService = {
      check: jest.fn().mockReturnValue({ status: 'ok' }),
      readiness: jest.fn().mockResolvedValue({
        status: 'ok',
        database: 'ok',
        redis: 'ok',
      }),
    };

    controller = new HealthController(healthService as unknown as HealthService);
  });

  it('should return ok status', () => {
    expect(controller.check()).toEqual({ status: 'ok' });
    expect(healthService.check).toHaveBeenCalled();
  });

  it('should return readiness status', async () => {
    await expect(controller.readiness()).resolves.toEqual({
      status: 'ok',
      database: 'ok',
      redis: 'ok',
    });
  });
});
