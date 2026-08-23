import {
  Injectable,
} from '@nestjs/common';
import type {
  RestaurantDto,
  RestaurantMenuItemDto,
  RestaurantSummaryDto,
  RestaurantsListResponseDto,
} from '@bitemate/shared';
import type {
  Prisma,
  Restaurant,
  RestaurantMenuItem,
  RestaurantOpeningHour,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { RankingService } from '../growth/ranking.service';
import {
  assertFound,
  assertOwner,
  assertValidTime,
  decimalToNumber,
  discountedPrice,
} from './marketplace.utils';
import type {
  CreateRestaurantDto,
  CreateRestaurantMenuItemDto,
  RestaurantsQueryDto,
} from './dto/marketplace.dto';

type RestaurantWithRelations = Restaurant & {
  openingHours: RestaurantOpeningHour[];
  menuItems: RestaurantMenuItem[];
};

@Injectable()
export class RestaurantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rankingService: RankingService,
  ) {}

  async createRestaurant(
    ownerId: string,
    dto: CreateRestaurantDto,
  ): Promise<RestaurantDto> {
    this.validateOpeningHours(dto.openingHours);

    const restaurant = await this.prisma.$transaction(async (tx) => {
      const created = await tx.restaurant.create({
        data: {
          ownerId,
          name: dto.name.trim(),
          description: dto.description?.trim(),
          profileImage: dto.profileImage,
          coverImage: dto.coverImage,
          address: dto.address?.trim(),
          city: dto.city?.trim(),
          country: dto.country?.trim(),
          latitude: dto.latitude,
          longitude: dto.longitude,
          phoneNumber: dto.phoneNumber?.trim(),
          cuisineTypes: dto.cuisineTypes ?? [],
          approvalStatus: 'PENDING',
          isActive: false,
          openingHours: dto.openingHours?.length
            ? {
                create: dto.openingHours.map((hour) => ({
                  dayOfWeek: hour.dayOfWeek,
                  openTime: hour.openTime,
                  closeTime: hour.closeTime,
                  isClosed: hour.isClosed ?? false,
                })),
              }
            : undefined,
        },
        include: {
          openingHours: true,
          menuItems: true,
        },
      });

      return created;
    });

    return this.toRestaurantDto(restaurant);
  }

  async listRestaurants(
    query: RestaurantsQueryDto,
  ): Promise<RestaurantsListResponseDto> {
    const where: Prisma.RestaurantWhereInput = {
      isActive: true,
      approvalStatus: 'APPROVED',
      ...(query.city ? { city: { equals: query.city, mode: 'insensitive' } } : {}),
      ...(query.country
        ? { country: { equals: query.country, mode: 'insensitive' } }
        : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const restaurants = await this.prisma.restaurant.findMany({
      where,
      orderBy: [{ rankScore: 'desc' }, { averageRating: 'desc' }, { createdAt: 'desc' }],
      take: query.limit + 1,
      ...(query.cursor
        ? {
            cursor: { id: query.cursor },
            skip: 1,
          }
        : {}),
    });

    const hasMore = restaurants.length > query.limit;
    const items = hasMore ? restaurants.slice(0, query.limit) : restaurants;

    return {
      items: items.map((restaurant) => this.toSummaryDto(restaurant)),
      nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
      hasMore,
    };
  }

  async getRestaurant(restaurantId: string, visitorId?: string): Promise<RestaurantDto> {
    const restaurant = assertFound(
      await this.prisma.restaurant.findFirst({
        where: { id: restaurantId, isActive: true, approvalStatus: 'APPROVED' },
        include: {
          openingHours: { orderBy: { dayOfWeek: 'asc' } },
          menuItems: {
            where: { isAvailable: true },
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
          },
        },
      }),
      'Restaurant not found',
    );

    void this.rankingService.recordRestaurantVisit(restaurantId, visitorId);

    return this.toRestaurantDto(restaurant);
  }

  async addMenuItem(
    ownerId: string,
    restaurantId: string,
    dto: CreateRestaurantMenuItemDto,
  ): Promise<RestaurantMenuItemDto> {
    const restaurant = assertFound(
      await this.prisma.restaurant.findUnique({ where: { id: restaurantId } }),
      'Restaurant not found',
    );
    assertOwner(ownerId, restaurant.ownerId, 'Only the restaurant owner can add menu items');

    const item = await this.prisma.restaurantMenuItem.create({
      data: {
        restaurantId,
        name: dto.name.trim(),
        description: dto.description?.trim(),
        price: dto.price,
        currency: dto.currency ?? 'USD',
        category: dto.category?.trim(),
        imageUrl: dto.imageUrl,
        discountPercent: dto.discountPercent ?? 0,
        isAvailable: dto.isAvailable ?? true,
      },
    });

    return this.toMenuItemDto(item);
  }

  private validateOpeningHours(
    openingHours: CreateRestaurantDto['openingHours'],
  ): void {
    if (!openingHours?.length) {
      return;
    }

    for (const hour of openingHours) {
      if (!hour.isClosed) {
        assertValidTime(hour.openTime, 'openTime');
        assertValidTime(hour.closeTime, 'closeTime');
      }
    }
  }

  private toSummaryDto(restaurant: Restaurant): RestaurantSummaryDto {
    return {
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.description,
      profileImage: restaurant.profileImage,
      coverImage: restaurant.coverImage,
      city: restaurant.city,
      country: restaurant.country,
      cuisineTypes: restaurant.cuisineTypes,
      averageRating: restaurant.averageRating,
      reviewCount: restaurant.reviewCount,
      rankScore: restaurant.rankScore,
      visitCount: restaurant.visitCount,
      conversionCount: restaurant.conversionCount,
      isSponsored: restaurant.isSponsored,
      isActive: restaurant.isActive,
      approvalStatus: restaurant.approvalStatus,
    };
  }

  private toMenuItemDto(item: RestaurantMenuItem): RestaurantMenuItemDto {
    const price = decimalToNumber(item.price);
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      price,
      currency: item.currency,
      category: item.category,
      imageUrl: item.imageUrl,
      discountPercent: item.discountPercent,
      discountedPrice: discountedPrice(price, item.discountPercent),
      isAvailable: item.isAvailable,
    };
  }

  private toRestaurantDto(restaurant: RestaurantWithRelations): RestaurantDto {
    return {
      ...this.toSummaryDto(restaurant),
      address: restaurant.address,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      phoneNumber: restaurant.phoneNumber,
      ownerId: restaurant.ownerId,
      isActive: restaurant.isActive,
      approvalStatus: restaurant.approvalStatus,
      createdAt: restaurant.createdAt.toISOString(),
      openingHours: restaurant.openingHours.map((hour) => ({
        dayOfWeek: hour.dayOfWeek,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
        isClosed: hour.isClosed,
      })),
      menuItems: restaurant.menuItems.map((item) => this.toMenuItemDto(item)),
    };
  }
}
