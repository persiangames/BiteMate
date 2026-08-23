import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function assertValidTime(value: string, field: string): void {
  if (!TIME_PATTERN.test(value)) {
    throw new BadRequestException(`${field} must be in HH:mm format`);
  }
}

export function parseDateOnly(value: string, field: string): Date {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException(`${field} must be a valid date (YYYY-MM-DD)`);
  }
  return parsed;
}

export function assertFutureDate(date: Date, field: string): void {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (date < today) {
    throw new BadRequestException(`${field} must be today or in the future`);
  }
}

export function decimalToNumber(value: Prisma.Decimal | number): number {
  return typeof value === 'number' ? value : value.toNumber();
}

export function discountedPrice(price: number, discountPercent: number): number {
  if (discountPercent <= 0) {
    return price;
  }
  return Math.round(price * (1 - discountPercent / 100) * 100) / 100;
}

export function assertOwner(userId: string, ownerId: string, message: string): void {
  if (userId !== ownerId) {
    throw new ForbiddenException(message);
  }
}

export function assertFound<T>(value: T | null | undefined, message: string): T {
  if (!value) {
    throw new NotFoundException(message);
  }
  return value;
}

export async function recalculateRestaurantRating(
  tx: Prisma.TransactionClient,
  restaurantId: string,
): Promise<void> {
  const aggregate = await tx.review.aggregate({
    where: { restaurantId, targetType: 'RESTAURANT' },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await tx.restaurant.update({
    where: { id: restaurantId },
    data: {
      averageRating: aggregate._avg.rating ?? 0,
      reviewCount: aggregate._count.rating,
    },
  });
}

export async function recalculateHomeChefRating(
  tx: Prisma.TransactionClient,
  homeChefProfileId: string,
): Promise<void> {
  const aggregate = await tx.review.aggregate({
    where: { homeChefProfileId, targetType: 'HOME_CHEF' },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await tx.homeChefProfile.update({
    where: { id: homeChefProfileId },
    data: {
      averageRating: aggregate._avg.rating ?? 0,
      reviewCount: aggregate._count.rating,
    },
  });
}
