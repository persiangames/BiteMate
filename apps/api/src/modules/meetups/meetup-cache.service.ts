import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { MeetupStatus } from '@prisma/client';
import { RedisService } from '../redis/redis.service';

export interface CachedMeetupMeta {
  id: string;
  creatorId: string;
  foodType: string;
  foodCategory: string;
  scheduledAt: string;
  radiusKm: string;
  desiredPeople: string;
  latitude: string;
  longitude: string;
  status: MeetupStatus;
  creatorRating: string;
}

@Injectable()
export class MeetupCacheService {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  private get geoKey(): string {
    return this.configService.get<string>('meetup.geoKey', 'bitemate:meetups:geo')!;
  }

  private get metaPrefix(): string {
    return this.configService.get<string>('meetup.metaPrefix', 'bitemate:meetups:meta:')!;
  }

  private get foodIndexPrefix(): string {
    return this.configService.get<string>(
      'meetup.foodIndexPrefix',
      'bitemate:meetups:food:',
    )!;
  }

  normalizeFoodType(foodType: string): string {
    return foodType.trim().toLowerCase().replace(/\s+/g, '-');
  }

  private metaKey(meetupId: string): string {
    return `${this.metaPrefix}${meetupId}`;
  }

  private foodKey(normalizedFood: string): string {
    return `${this.foodIndexPrefix}${normalizedFood}`;
  }

  private inviteCountKey(userId: string): string {
    const day = new Date().toISOString().slice(0, 10);
    return `bitemate:meetups:invites:${userId}:${day}`;
  }

  async cacheActiveMeetup(
    meta: CachedMeetupMeta,
    expiresAt: Date,
  ): Promise<void> {
    const client = this.redisService.getClient();
    const ttlSeconds = Math.max(
      60,
      Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    );
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

  async removeMeetup(meetupId: string, foodType: string): Promise<void> {
    const client = this.redisService.getClient();
    const normalizedFood = this.normalizeFoodType(foodType);
    const pipeline = client.pipeline();
    pipeline.zrem(this.geoKey, meetupId);
    pipeline.del(this.metaKey(meetupId));
    pipeline.srem(this.foodKey(normalizedFood), meetupId);
    await pipeline.exec();
  }

  async getMeetupMeta(meetupId: string): Promise<CachedMeetupMeta | null> {
    const client = this.redisService.getClient();
    const raw = await client.hgetall(this.metaKey(meetupId));
    if (!raw.id) {
      return null;
    }
    return raw as unknown as CachedMeetupMeta;
  }

  async findNearbyMeetupIds(params: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  }): Promise<Array<{ meetupId: string; distanceKm: number }>> {
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

    return rawResults.map(([meetupId, distance]) => ({
      meetupId,
      distanceKm: Number.parseFloat(distance),
    }));
  }

  async getFoodTypeMeetupIds(normalizedFood: string): Promise<string[]> {
    const client = this.redisService.getClient();
    return client.smembers(this.foodKey(normalizedFood));
  }

  async incrementDailyInviteCount(userId: string): Promise<number> {
    const client = this.redisService.getClient();
    const key = this.inviteCountKey(userId);
    const count = await client.incr(key);
    if (count === 1) {
      await client.expire(key, 86_400);
    }
    return count;
  }

  async getDailyInviteCount(userId: string): Promise<number> {
    const client = this.redisService.getClient();
    const value = await client.get(this.inviteCountKey(userId));
    return value ? Number.parseInt(value, 10) : 0;
  }
}
