import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AvailabilityStatus, NearbyUserDto, UserRole } from '@bitemate/shared';
import { RedisService } from '../redis/redis.service';

interface GeoUserMeta {
  role: string;
  availability: AvailabilityStatus;
  username: string;
  fullName: string;
  profileImage: string;
  city: string;
  country: string;
}

@Injectable()
export class GeoLocationService {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  private get geoKey(): string {
    return this.configService.get<string>('location.geoKey', 'bitemate:geo:live')!;
  }

  private get ttlSeconds(): number {
    return this.configService.get<number>('location.liveLocationTtlSeconds', 300)!;
  }

  private metaKey(userId: string): string {
    return `bitemate:geo:meta:${userId}`;
  }

  async upsertLiveLocation(
    userId: string,
    latitude: number,
    longitude: number,
    meta: GeoUserMeta,
  ): Promise<void> {
    const client = this.redisService.getClient();
    const pipeline = client.pipeline();

    pipeline.geoadd(this.geoKey, longitude, latitude, userId);
    pipeline.hset(this.metaKey(userId), {
      role: meta.role,
      availability: meta.availability,
      username: meta.username,
      fullName: meta.fullName,
      profileImage: meta.profileImage,
      city: meta.city,
      country: meta.country,
    });
    pipeline.expire(this.metaKey(userId), this.ttlSeconds);

    await pipeline.exec();
  }

  async removeLiveLocation(userId: string): Promise<void> {
    const client = this.redisService.getClient();
    const pipeline = client.pipeline();
    pipeline.zrem(this.geoKey, userId);
    pipeline.del(this.metaKey(userId));
    await pipeline.exec();
  }

  async findNearby(params: {
    latitude: number;
    longitude: number;
    radiusKm: number;
    role?: UserRole;
    availability?: AvailabilityStatus;
    excludeUserId?: string;
  }): Promise<NearbyUserDto[]> {
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

    const users: NearbyUserDto[] = [];

    for (const [userId, distance] of rawResults) {
      if (params.excludeUserId && userId === params.excludeUserId) {
        continue;
      }

      const meta = await client.hgetall(this.metaKey(userId));
      if (!meta.role) {
        continue;
      }

      if (params.role && meta.role !== params.role) {
        continue;
      }

      if (
        params.availability &&
        meta.availability !== params.availability
      ) {
        continue;
      }

      const position = (await client.geopos(this.geoKey, userId))?.[0];
      if (!position) {
        continue;
      }

      const [longitude, latitude] = position;

      users.push({
        id: userId,
        username: meta.username || null,
        fullName: meta.fullName || null,
        bio: null,
        role: meta.role as UserRole,
        profileImage: meta.profileImage || null,
        availabilityStatus: meta.availability as AvailabilityStatus,
        distanceKm: Number.parseFloat(distance),
        latitude: Number.parseFloat(latitude),
        longitude: Number.parseFloat(longitude),
        city: meta.city || null,
        country: meta.country || null,
        age: null,
        gender: null,
        education: null,
        preferredMeals: [],
        favoriteCuisines: [],
        favoriteFoods: [],
        lookingToEat: false,
        interests: [],
        relationshipStatus: null,
        meetupRating: 0,
        meetupReviewCount: 0,
        lastLiveLocationAt: null,
        isOnline: meta.availability === 'AVAILABLE',
        compatibility: 42,
      });
    }

    return users;
  }
}
