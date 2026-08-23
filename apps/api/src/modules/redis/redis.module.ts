import { Global, Module } from '@nestjs/common';
import { RateLimiterService } from './rate-limiter.service';
import { RedisThrottlerStorage } from './redis-throttler.storage';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [RedisService, RateLimiterService, RedisThrottlerStorage],
  exports: [RedisService, RateLimiterService, RedisThrottlerStorage],
})
export class RedisModule {}
