import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { BookingDto, BookingsListResponseDto } from '@bitemate/shared';
import type { Booking, HomeChefMenuItem, Restaurant } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { MonetizationService } from '../growth/monetization.service';
import { RankingService } from '../growth/ranking.service';
import {
  assertFound,
  assertFutureDate,
  assertValidTime,
  decimalToNumber,
  parseDateOnly,
} from './marketplace.utils';
import type { CreateBookingDto, UpdateBookingStatusDto } from './dto/marketplace.dto';

type BookingWithRelations = Booking & {
  restaurant: Pick<Restaurant, 'name' | 'ownerId'> | null;
  homeChefProfile: {
    id: string;
    userId: string;
    user: { fullName: string | null };
  } | null;
  homeChefMenuItem: Pick<HomeChefMenuItem, 'name'> | null;
};

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly monetizationService: MonetizationService,
  ) {}

  async createBooking(
    customerId: string,
    dto: CreateBookingDto,
  ): Promise<BookingDto> {
    assertValidTime(dto.bookingTime, 'bookingTime');
    const bookingDate = parseDateOnly(dto.bookingDate, 'bookingDate');
    assertFutureDate(bookingDate, 'bookingDate');

    if (dto.type === 'RESTAURANT_TABLE') {
      return this.createRestaurantBooking(customerId, dto, bookingDate);
    }

    return this.createHomeChefBooking(customerId, dto, bookingDate);
  }

  async listMyBookings(userId: string): Promise<BookingsListResponseDto> {
    const bookings = await this.prisma.booking.findMany({
      where: { customerId: userId },
      include: {
        restaurant: { select: { name: true, ownerId: true } },
        homeChefProfile: {
          select: {
            id: true,
            userId: true,
            user: { select: { fullName: true } },
          },
        },
        homeChefMenuItem: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return { items: bookings.map((booking) => this.toBookingDto(booking)) };
  }

  async updateBookingStatus(
    userId: string,
    bookingId: string,
    dto: UpdateBookingStatusDto,
  ): Promise<BookingDto> {
    const booking = assertFound(
      await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          restaurant: { select: { name: true, ownerId: true } },
          homeChefProfile: {
            select: {
              id: true,
              userId: true,
              user: { select: { fullName: true } },
            },
          },
          homeChefMenuItem: { select: { name: true } },
        },
      }),
      'Booking not found',
    );

    const isCustomer = booking.customerId === userId;
    const isRestaurantOwner = booking.restaurant?.ownerId === userId;
    const isHomeChef = booking.homeChefProfile?.userId === userId;

    if (dto.status === 'CANCELLED') {
      if (!isCustomer && !isRestaurantOwner && !isHomeChef) {
        throw new ForbiddenException('Not allowed to cancel this booking');
      }
    } else if (!isRestaurantOwner && !isHomeChef) {
      throw new ForbiddenException('Only the provider can update booking status');
    }

    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
      throw new BadRequestException('Booking is already finalized');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const saved = await tx.booking.update({
        where: { id: bookingId },
        data: { status: dto.status },
        include: {
          restaurant: { select: { name: true, ownerId: true } },
          homeChefProfile: {
            select: {
              id: true,
              userId: true,
              user: { select: { fullName: true } },
            },
          },
          homeChefMenuItem: { select: { name: true } },
        },
      });

      if (
        dto.status === 'CANCELLED' &&
        booking.type === 'HOME_CHEF_MEAL' &&
        booking.homeChefMenuItemId
      ) {
        await tx.homeChefMenuItem.update({
          where: { id: booking.homeChefMenuItemId },
          data: { servingsSold: { decrement: booking.quantity } },
        });
      }

      return saved;
    });

    if (dto.status === 'COMPLETED') {
      await this.monetizationService.handleBookingCompleted(
        bookingId,
        updated.restaurantId,
        updated.affiliateReferrerId,
        decimalToNumber(updated.totalPrice),
      );
    }

    return this.toBookingDto(updated);
  }

  private async createRestaurantBooking(
    customerId: string,
    dto: CreateBookingDto,
    bookingDate: Date,
  ): Promise<BookingDto> {
    if (!dto.restaurantId) {
      throw new BadRequestException('restaurantId is required for restaurant table bookings');
    }

    if (!dto.partySize || dto.partySize < 1) {
      throw new BadRequestException('partySize is required for restaurant table bookings');
    }

    const restaurant = assertFound(
      await this.prisma.restaurant.findFirst({
        where: { id: dto.restaurantId, isActive: true },
      }),
      'Restaurant not found',
    );

    const booking = await this.prisma.booking.create({
      data: {
        customerId,
        type: 'RESTAURANT_TABLE',
        restaurantId: restaurant.id,
        bookingDate,
        bookingTime: dto.bookingTime,
        partySize: dto.partySize,
        quantity: 1,
        totalPrice: 0,
        currency: 'USD',
        notes: dto.notes?.trim(),
        affiliateReferrerId: dto.affiliateReferrerId,
      },
      include: {
        restaurant: { select: { name: true, ownerId: true } },
        homeChefProfile: {
          select: {
            id: true,
            userId: true,
            user: { select: { fullName: true } },
          },
        },
        homeChefMenuItem: { select: { name: true } },
      },
    });

    return this.toBookingDto(booking);
  }

  private async createHomeChefBooking(
    customerId: string,
    dto: CreateBookingDto,
    bookingDate: Date,
  ): Promise<BookingDto> {
    if (!dto.homeChefMenuItemId) {
      throw new BadRequestException('homeChefMenuItemId is required for home chef meal bookings');
    }

    const quantity = dto.quantity ?? 1;

    const booking = await this.prisma.$transaction(async (tx) => {
      const menuItem = assertFound(
        await tx.homeChefMenuItem.findFirst({
          where: {
            id: dto.homeChefMenuItemId,
            isActive: true,
            homeChefProfile: { isActive: true, acceptsOrders: true },
          },
          include: { homeChefProfile: true },
        }),
        'Home chef menu item not found',
      );

      const menuDate = menuItem.availableDate.toISOString().slice(0, 10);
      const requestedDate = bookingDate.toISOString().slice(0, 10);
      if (menuDate !== requestedDate) {
        throw new BadRequestException('bookingDate must match the menu item available date');
      }

      const remaining = menuItem.servingsAvailable - menuItem.servingsSold;
      if (quantity > remaining) {
        throw new BadRequestException('Not enough servings available');
      }

      const updatedMenuItem = await tx.homeChefMenuItem.update({
        where: { id: menuItem.id },
        data: { servingsSold: { increment: quantity } },
      });

      if (updatedMenuItem.servingsSold > updatedMenuItem.servingsAvailable) {
        throw new BadRequestException('Not enough servings available');
      }

      return tx.booking.create({
        data: {
          customerId,
          type: 'HOME_CHEF_MEAL',
          homeChefProfileId: menuItem.homeChefProfileId,
          homeChefMenuItemId: menuItem.id,
          bookingDate,
          bookingTime: dto.bookingTime,
          quantity,
          totalPrice: decimalToNumber(menuItem.price) * quantity,
          currency: menuItem.currency,
          notes: dto.notes?.trim(),
          affiliateReferrerId: dto.affiliateReferrerId,
        },
        include: {
          restaurant: { select: { name: true, ownerId: true } },
          homeChefProfile: {
            select: {
              id: true,
              userId: true,
              user: { select: { fullName: true } },
            },
          },
          homeChefMenuItem: { select: { name: true } },
        },
      });
    });

    return this.toBookingDto(booking);
  }

  private toBookingDto(booking: BookingWithRelations): BookingDto {
    return {
      id: booking.id,
      type: booking.type,
      status: booking.status,
      restaurantId: booking.restaurantId,
      restaurantName: booking.restaurant?.name ?? null,
      homeChefProfileId: booking.homeChefProfileId,
      homeChefName: booking.homeChefProfile?.user.fullName ?? null,
      homeChefMenuItemId: booking.homeChefMenuItemId,
      menuItemName: booking.homeChefMenuItem?.name ?? null,
      bookingDate: booking.bookingDate.toISOString().slice(0, 10),
      bookingTime: booking.bookingTime,
      partySize: booking.partySize,
      quantity: booking.quantity,
      totalPrice: decimalToNumber(booking.totalPrice),
      currency: booking.currency,
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString(),
    };
  }
}
