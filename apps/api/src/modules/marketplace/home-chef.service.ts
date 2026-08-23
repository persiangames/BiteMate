import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import type {
  HomeChefMenuItemDto,
  HomeChefProfileDto,
  HomeChefSummaryDto,
} from '@bitemate/shared';
import type {
  HomeChefAvailability,
  HomeChefMenuItem,
  HomeChefProfile,
  User,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import {
  assertFound,
  assertFutureDate,
  assertValidTime,
  decimalToNumber,
  parseDateOnly,
} from './marketplace.utils';
import type {
  CreateHomeChefMenuDto,
  CreateHomeChefProfileDto,
  HomeChefMenuQueryDto,
} from './dto/marketplace.dto';

type HomeChefProfileWithRelations = HomeChefProfile & {
  user: Pick<User, 'fullName' | 'username' | 'profileImage'>;
  availability: HomeChefAvailability[];
  menuItems: HomeChefMenuItem[];
};

@Injectable()
export class HomeChefService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertProfile(
    userId: string,
    dto: CreateHomeChefProfileDto,
  ): Promise<HomeChefProfileDto> {
    this.validateAvailability(dto.availability);

    const profile = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.homeChefProfile.findUnique({ where: { userId } });

      const saved = existing
        ? await tx.homeChefProfile.update({
            where: { userId },
            data: {
              bio: dto.bio?.trim(),
              specialties: dto.specialties ?? existing.specialties,
              acceptsOrders: dto.acceptsOrders ?? existing.acceptsOrders,
            },
          })
        : await tx.homeChefProfile.create({
            data: {
              userId,
              bio: dto.bio?.trim(),
              specialties: dto.specialties ?? [],
              acceptsOrders: dto.acceptsOrders ?? true,
            },
          });

      if (dto.availability?.length) {
        await tx.homeChefAvailability.deleteMany({
          where: { homeChefProfileId: saved.id },
        });
        await tx.homeChefAvailability.createMany({
          data: dto.availability.map((slot) => ({
            homeChefProfileId: saved.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
        });
      }

      return tx.homeChefProfile.findUniqueOrThrow({
        where: { id: saved.id },
        include: {
          user: {
            select: { fullName: true, username: true, profileImage: true },
          },
          availability: { orderBy: { dayOfWeek: 'asc' } },
          menuItems: {
            where: { isActive: true },
            orderBy: [{ availableDate: 'asc' }, { name: 'asc' }],
          },
        },
      });
    });

    return this.toProfileDto(profile);
  }

  async getMyProfile(userId: string): Promise<HomeChefProfileDto> {
    const profile = assertFound(
      await this.prisma.homeChefProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: { fullName: true, username: true, profileImage: true },
          },
          availability: { orderBy: { dayOfWeek: 'asc' } },
          menuItems: {
            where: { isActive: true },
            orderBy: [{ availableDate: 'asc' }, { name: 'asc' }],
          },
        },
      }),
      'Home chef profile not found. Create your profile first.',
    );

    return this.toProfileDto(profile);
  }

  async getProfile(chefProfileId: string): Promise<HomeChefProfileDto> {
    const profile = assertFound(
      await this.prisma.homeChefProfile.findFirst({
        where: { id: chefProfileId, isActive: true },
        include: {
          user: {
            select: { fullName: true, username: true, profileImage: true },
          },
          availability: { orderBy: { dayOfWeek: 'asc' } },
          menuItems: {
            where: { isActive: true },
            orderBy: [{ availableDate: 'asc' }, { name: 'asc' }],
          },
        },
      }),
      'Home chef not found',
    );

    return this.toProfileDto(profile);
  }

  async createMenuItem(
    userId: string,
    dto: CreateHomeChefMenuDto,
  ): Promise<HomeChefMenuItemDto> {
    const profile = assertFound(
      await this.prisma.homeChefProfile.findUnique({ where: { userId } }),
      'Home chef profile not found. Create your profile first.',
    );

    if (!profile.acceptsOrders || !profile.isActive) {
      throw new BadRequestException('Home chef is not accepting orders');
    }

    const availableDate = parseDateOnly(dto.availableDate, 'availableDate');
    assertFutureDate(availableDate, 'availableDate');

    const item = await this.prisma.homeChefMenuItem.create({
      data: {
        homeChefProfileId: profile.id,
        name: dto.name.trim(),
        description: dto.description?.trim(),
        price: dto.price,
        currency: dto.currency ?? 'USD',
        imageUrl: dto.imageUrl,
        availableDate,
        servingsAvailable: dto.servingsAvailable,
      },
    });

    return this.toMenuItemDto(item);
  }

  async listMenuItems(query: HomeChefMenuQueryDto): Promise<HomeChefMenuItemDto[]> {
    const where: {
      isActive: boolean;
      homeChefProfileId?: string;
      availableDate?: Date;
    } = { isActive: true };

    if (query.chefId) {
      where.homeChefProfileId = query.chefId;
    }

    if (query.date) {
      where.availableDate = parseDateOnly(query.date, 'date');
    }

    const items = await this.prisma.homeChefMenuItem.findMany({
      where,
      orderBy: [{ availableDate: 'asc' }, { name: 'asc' }],
      take: 100,
    });

    return items.map((item) => this.toMenuItemDto(item));
  }

  async listHomeChefs(): Promise<HomeChefSummaryDto[]> {
    const profiles = await this.prisma.homeChefProfile.findMany({
      where: { isActive: true, acceptsOrders: true },
      include: {
        user: { select: { fullName: true, username: true, profileImage: true } },
      },
      orderBy: [{ averageRating: 'desc' }, { createdAt: 'desc' }],
      take: 50,
    });

    return profiles.map((profile) => ({
      id: profile.id,
      chefName: profile.user.fullName,
      chefUsername: profile.user.username,
      chefProfileImage: profile.user.profileImage,
      bio: profile.bio,
      specialties: profile.specialties,
      averageRating: profile.averageRating,
      reviewCount: profile.reviewCount,
    }));
  }

  private validateAvailability(
    availability: CreateHomeChefProfileDto['availability'],
  ): void {
    if (!availability?.length) {
      return;
    }

    for (const slot of availability) {
      assertValidTime(slot.startTime, 'startTime');
      assertValidTime(slot.endTime, 'endTime');
    }
  }

  private toMenuItemDto(item: HomeChefMenuItem): HomeChefMenuItemDto {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      price: decimalToNumber(item.price),
      currency: item.currency,
      imageUrl: item.imageUrl,
      availableDate: item.availableDate.toISOString().slice(0, 10),
      servingsAvailable: item.servingsAvailable,
      servingsRemaining: item.servingsAvailable - item.servingsSold,
      isActive: item.isActive,
    };
  }

  private toProfileDto(profile: HomeChefProfileWithRelations): HomeChefProfileDto {
    return {
      id: profile.id,
      userId: profile.userId,
      bio: profile.bio,
      specialties: profile.specialties,
      averageRating: profile.averageRating,
      reviewCount: profile.reviewCount,
      acceptsOrders: profile.acceptsOrders,
      isActive: profile.isActive,
      chefName: profile.user.fullName,
      chefUsername: profile.user.username,
      chefProfileImage: profile.user.profileImage,
      availability: profile.availability.map((slot) => ({
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
      menuItems: profile.menuItems.map((item) => this.toMenuItemDto(item)),
    };
  }
}
