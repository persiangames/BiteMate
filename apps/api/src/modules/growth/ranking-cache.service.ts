import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  RestaurantRankingsResponseDto,
  UserRankingsResponseDto,
} from '@bitemate/shared';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RankingCacheService {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  private ttl(): number {
    return this.configService.get<number>('ranking.cacheTtlSeconds', 120)!;
  }

  private dailyActivityCap(): number {
    return this.configService.get<number>('ranking.dailyActivityCap', 20)!;
  }

  async getUserRankings(cityKey: string): Promise<UserRankingsResponseDto | null> {
    const raw = await this.redisService.getClient().get(this.userKey(cityKey));
    return raw ? (JSON.parse(raw) as UserRankingsResponseDto) : null;
  }

  async setUserRankings(cityKey: string, data: UserRankingsResponseDto): Promise<void> {
    await this.redisService
      .getClient()
      .set(this.userKey(cityKey), JSON.stringify(data), 'EX', this.ttl());
  }

  async getRestaurantRankings(
    cityKey: string,
  ): Promise<RestaurantRankingsResponseDto | null> {
    const raw = await this.redisService.getClient().get(this.restaurantKey(cityKey));
    return raw ? (JSON.parse(raw) as RestaurantRankingsResponseDto) : null;
  }

  async setRestaurantRankings(
    cityKey: string,
    data: RestaurantRankingsResponseDto,
  ): Promise<void> {
    await this.redisService
      .getClient()
      .set(this.restaurantKey(cityKey), JSON.stringify(data), 'EX', this.ttl());
  }

  async invalidateAll(): Promise<void> {
    const client = this.redisService.getClient();
    const keys = await client.keys('bitemate:ranking:*');
    if (keys.length > 0) {
      await client.del(...keys);
    }
  }

  async consumeActivityBudget(userId: string, requested: number): Promise<number> {
    const client = this.redisService.getClient();
    const key = `bitemate:ranking:activity:${userId}:${this.todayKey()}`;
    const current = Number(await client.get(key)) || 0;
    const remaining = Math.max(0, this.dailyActivityCap() - current);
    const granted = Math.min(requested, remaining);
    if (granted > 0) {
      await client.incrby(key, granted);
      await client.expire(key, 86_400);
    }
    return granted;
  }

  async markRestaurantVisit(restaurantId: string, visitorId: string): Promise<boolean> {
    const client = this.redisService.getClient();
    const key = `bitemate:ranking:visit:${restaurantId}:${visitorId}:${this.todayKey()}`;
    const inserted = await client.set(key, '1', 'EX', 86_400, 'NX');
    return inserted === 'OK';
  }

  private userKey(cityKey: string): string {
    return `bitemate:ranking:users:${cityKey}`;
  }

  private restaurantKey(cityKey: string): string {
    return `bitemate:ranking:restaurants:${cityKey}`;
  }

  private todayKey(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
