import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { FoodIntentStatus } from '@prisma/client';
import { RedisService } from '../redis/redis.service';

export interface CachedIntentMeta {
  id: string;
  userId: string;
  foodType: string;
  foodCategory: string;
  timeStart: string;
  timeEnd: string;
  radiusKm: string;
  desiredPeople: string;
  latitude: string;
  longitude: string;
  budgetMin: string;
  budgetMax: string;
  status: FoodIntentStatus;
  userRating: string;
  userReviewCount: string;
  userSuccessfulMeetups: string;
  userCancelCount: string;
  userRankScore: string;
  userRole: string;
  isPremium: string;
}

@Injectable()
export class IntentCacheService {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  private get geoKey(): string {
    return this.configService.get<string>('intent.geoKey', 'bitemate:intents:geo')!;
  }

  private get metaPrefix(): string {
    return this.configService.get<string>('intent.metaPrefix', 'bitemate:intents:meta:')!;
  }

  private get foodIndexPrefix(): string {
    return this.configService.get<string>(
      'intent.foodIndexPrefix',
      'bitemate:intents:food:',
    )!;
  }

  private get matchCachePrefix(): string {
    return this.configService.get<string>(
      'intent.matchCachePrefix',
      'bitemate:intents:matches:',
    )!;
  }

  normalizeFoodType(foodType: string): string {
    return foodType.trim().toLowerCase().replace(/\s+/g, '-');
  }

  private metaKey(intentId: string): string {
    return `${this.metaPrefix}${intentId}`;
  }

  private foodKey(normalizedFood: string): string {
    return `${this.foodIndexPrefix}${normalizedFood}`;
  }

  private matchKey(intentId: string): string {
    return `${this.matchCachePrefix}${intentId}`;
  }

  async cacheActiveIntent(meta: CachedIntentMeta, expiresAt: Date): Promise<void> {
    const client = this.redisService.getClient();
    const ttlSeconds = Math.max(60, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
    const normalizedFood = this.normalizeFoodType(meta.foodType);
    const pipeline = client.pipeline();

    pipeline.geoadd(
      this.geoKey,
      Number.parseFloat(meta.longitude),
      Number.parseFloat(meta.latitude),
      meta.id,
    );
    pipeline.hset(this.metaKey(meta.id), meta);
    pipeline.expire(this.metaKey(meta.id), ttlSeconds);
    pipeline.sadd(this.foodKey(normalizedFood), meta.id);
    pipeline.expire(this.foodKey(normalizedFood), ttlSeconds);

    await pipeline.exec();
  }

  async removeIntent(intentId: string, foodType: string): Promise<void> {
    const client = this.redisService.getClient();
    const normalizedFood = this.normalizeFoodType(foodType);
    const pipeline = client.pipeline();
    pipeline.zrem(this.geoKey, intentId);
    pipeline.del(this.metaKey(intentId));
    pipeline.del(this.matchKey(intentId));
    pipeline.srem(this.foodKey(normalizedFood), intentId);
    await pipeline.exec();
  }

  async getIntentMeta(intentId: string): Promise<CachedIntentMeta | null> {
    const client = this.redisService.getClient();
    const raw = await client.hgetall(this.metaKey(intentId));
    if (!raw.id) {
      return null;
    }
    return raw as unknown as CachedIntentMeta;
  }

  async getIntentMetaBatch(intentIds: string[]): Promise<Map<string, CachedIntentMeta>> {
    if (!intentIds.length) {
      return new Map();
    }

    const client = this.redisService.getClient();
    const pipeline = client.pipeline();
    for (const id of intentIds) {
      pipeline.hgetall(this.metaKey(id));
    }
    const results = await pipeline.exec();
    const map = new Map<string, CachedIntentMeta>();

    results?.forEach((entry, index) => {
      const raw = entry?.[1] as Record<string, string> | null;
      if (raw?.id) {
        map.set(intentIds[index]!, raw as unknown as CachedIntentMeta);
      }
    });

    return map;
  }

  async findNearbyIntentIds(params: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  }): Promise<Array<{ intentId: string; distanceKm: number }>> {
    const client = this.redisService.getClient();
    const rawResults = (await client.georadius(
      this.geoKey,
      params.longitude,
      params.latitude,
      params.radiusKm,
      'km',
      'WITHDIST',
      'ASC',
    )) as Array<[string, string]>;

    return rawResults.map(([intentId, distance]) => ({
      intentId,
      distanceKm: Number.parseFloat(distance),
    }));
  }

  async getFoodTypeIntentIds(normalizedFood: string): Promise<string[]> {
    const client = this.redisService.getClient();
    return client.smembers(this.foodKey(normalizedFood));
  }

  async setMatchCache(intentId: string, payload: string, ttlSeconds: number): Promise<void> {
    const client = this.redisService.getClient();
    await client.setex(this.matchKey(intentId), ttlSeconds, payload);
  }

  async getMatchCache(intentId: string): Promise<string | null> {
    const client = this.redisService.getClient();
    return client.get(this.matchKey(intentId));
  }

  async invalidateMatchCache(intentId: string): Promise<void> {
    const client = this.redisService.getClient();
    await client.del(this.matchKey(intentId));
  }
}
