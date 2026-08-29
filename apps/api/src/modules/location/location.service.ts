import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  AuthUserDto,
  NearbyUserDto,
  NearbyUsersResponseDto,
  UpdateLiveLocationRequestDto,
} from '@bitemate/shared';
import {
  ageFromDateOfBirth,
  diningCompatibility,
  isRecentlyOnline,
  tagsMatch,
} from '../../common/dining';
import { PrismaService } from '../database/prisma.service';
import { mapUserToAuthDto } from '../auth/mappers/user.mapper';
import { GeoLocationService } from './geo-location.service';
import type { NearbyUsersQueryDto } from './dto/location.dto';

@Injectable()
export class LocationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geoLocationService: GeoLocationService,
  ) {}

  async updateLiveLocation(
    userId: string,
    dto: UpdateLiveLocationRequestDto,
  ): Promise<AuthUserDto> {
    this.validateCoordinates(dto.latitude, dto.longitude);

    const existing = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    if (!existing.liveLocationEnabled) {
      throw new BadRequestException('Live location sharing is disabled');
    }

    if (existing.invisibleMode) {
      throw new BadRequestException('Live location cannot be updated in invisible mode');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        liveLatitude: dto.latitude,
        liveLongitude: dto.longitude,
        lastLiveLocationAt: new Date(),
        availabilityStatus:
          existing.availabilityStatus === 'OFFLINE'
            ? 'AVAILABLE'
            : existing.availabilityStatus,
      },
    });

    await this.syncRedisIndex(user);

    return mapUserToAuthDto(user);
  }

  async findNearbyUsers(
    requesterId: string,
    query: NearbyUsersQueryDto,
  ): Promise<NearbyUsersResponseDto> {
    this.validateCoordinates(query.latitude, query.longitude);

    const users = await this.findNearbyFromDatabase(requesterId, query);

    return {
      radiusKm: query.radiusKm,
      count: users.length,
      users,
    };
  }

  private async findNearbyFromDatabase(
    requesterId: string,
    query: NearbyUsersQueryDto,
  ): Promise<NearbyUserDto[]> {
    const latDelta = query.radiusKm / 111;
    const cosLat = Math.cos((query.latitude * Math.PI) / 180);
    const lngDelta = query.radiusKm / (111 * Math.max(0.2, Math.abs(cosLat)));

    const viewer = await this.prisma.user.findUnique({
      where: { id: requesterId },
      select: {
        preferredMeals: true,
        favoriteCuisines: true,
        favoriteFoods: true,
        interests: true,
        relationshipStatus: true,
        city: true,
        country: true,
      },
    });

    const candidates = await this.prisma.user.findMany({
      where: {
        id: { not: requesterId },
        isActive: true,
        invisibleMode: false,
        liveLatitude: {
          gte: query.latitude - latDelta,
          lte: query.latitude + latDelta,
        },
        liveLongitude: {
          gte: query.longitude - lngDelta,
          lte: query.longitude + lngDelta,
        },
        ...(query.role ? { role: query.role } : {}),
        ...(query.availability ? { availabilityStatus: query.availability } : {}),
        ...(query.gender ? { gender: query.gender } : {}),
        ...(query.education ? { education: query.education } : {}),
        ...(query.relationshipStatus ? { relationshipStatus: query.relationshipStatus } : {}),
        ...(query.country
          ? { country: { equals: query.country, mode: 'insensitive' } }
          : {}),
        ...(query.city ? { city: { equals: query.city, mode: 'insensitive' } } : {}),
        ...(query.lookingToEat ? { lookingToEat: true } : {}),
        ...(query.mealSlot ? { preferredMeals: { has: query.mealSlot } } : {}),
        ...(query.interests?.length ? { interests: { hasSome: query.interests } } : {}),
      },
      take: 800,
    });

    return candidates
      .map((user) => {
        const distanceKm = haversineKm(
          query.latitude,
          query.longitude,
          user.liveLatitude!,
          user.liveLongitude!,
        );
        const age = ageFromDateOfBirth(user.dateOfBirth);
        return {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          bio: user.bio,
          role: user.role,
          profileImage: user.profileImage,
          availabilityStatus: user.availabilityStatus,
          distanceKm: Math.round(distanceKm * 100) / 100,
          latitude: user.liveLatitude!,
          longitude: user.liveLongitude!,
          city: user.city,
          country: user.country,
          age,
          gender: user.gender,
          education: user.education,
          preferredMeals: user.preferredMeals as NearbyUserDto['preferredMeals'],
          favoriteCuisines: user.favoriteCuisines ?? [],
          favoriteFoods: user.favoriteFoods ?? [],
          lookingToEat: user.lookingToEat,
          interests: (user.interests ?? []) as NearbyUserDto['interests'],
          relationshipStatus: user.relationshipStatus,
          meetupRating: user.meetupRating,
          meetupReviewCount: user.meetupReviewCount,
          lastLiveLocationAt: user.lastLiveLocationAt
            ? user.lastLiveLocationAt.toISOString()
            : null,
          isOnline:
            user.availabilityStatus === 'AVAILABLE' || isRecentlyOnline(user.lastLiveLocationAt),
          compatibility: diningCompatibility(viewer, user),
        } satisfies NearbyUserDto;
      })
      .filter((user) => {
        if (user.distanceKm > query.radiusKm) return false;
        if (query.ageMin != null && (user.age == null || user.age < query.ageMin)) return false;
        if (query.ageMax != null && (user.age == null || user.age > query.ageMax)) return false;
        if (!tagsMatch(user.favoriteCuisines, query.foodType)) return false;
        if (!tagsMatch(user.favoriteFoods, query.foodName)) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.lookingToEat !== b.lookingToEat) {
          return a.lookingToEat ? -1 : 1;
        }
        if (b.compatibility !== a.compatibility) {
          return b.compatibility - a.compatibility;
        }
        return a.distanceKm - b.distanceKm;
      })
      .slice(0, 80);
  }

  async syncRedisIndex(user: {
    id: string;
    liveLocationEnabled: boolean;
    invisibleMode: boolean;
    otpVerified: boolean;
    liveLatitude: number | null;
    liveLongitude: number | null;
    role: string | null;
    availabilityStatus: string;
    username: string | null;
    fullName: string | null;
    profileImage: string | null;
    city: string | null;
    country: string | null;
  }): Promise<void> {
    const shouldIndex =
      user.otpVerified &&
      user.liveLocationEnabled &&
      !user.invisibleMode &&
      user.liveLatitude !== null &&
      user.liveLongitude !== null &&
      user.role !== null;

    if (!shouldIndex) {
      await this.geoLocationService.removeLiveLocation(user.id);
      return;
    }

    await this.geoLocationService.upsertLiveLocation(
      user.id,
      user.liveLatitude!,
      user.liveLongitude!,
      {
        role: user.role!,
        availability: user.availabilityStatus as 'AVAILABLE' | 'BUSY' | 'OFFLINE',
        username: user.username ?? '',
        fullName: user.fullName ?? '',
        profileImage: user.profileImage ?? '',
        city: user.city ?? '',
        country: user.country ?? '',
      },
    );
  }

  private validateCoordinates(latitude: number, longitude: number): void {
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new BadRequestException('Invalid coordinates');
    }
  }
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
