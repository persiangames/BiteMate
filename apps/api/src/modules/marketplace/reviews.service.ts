import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import type { ReviewDto, ReviewsListResponseDto } from '@bitemate/shared';
import type { Review, User } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { RankingService } from '../growth/ranking.service';
import {
  assertFound,
  recalculateHomeChefRating,
  recalculateRestaurantRating,
} from './marketplace.utils';
import type { CreateReviewDto, ReviewsQueryDto } from './dto/marketplace.dto';

type ReviewWithAuthor = Review & {
  reviewer: Pick<User, 'id' | 'username' | 'fullName' | 'profileImage'>;
};

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rankingService: RankingService,
  ) {}

  async createReview(
    reviewerId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewDto> {
    if (dto.targetType === 'RESTAURANT' && !dto.restaurantId) {
      throw new BadRequestException('restaurantId is required for restaurant reviews');
    }

    if (dto.targetType === 'HOME_CHEF' && !dto.homeChefProfileId) {
      throw new BadRequestException('homeChefProfileId is required for home chef reviews');
    }

    let isVerifiedPurchase = false;
    let bookingRestaurantId: string | null = null;
    let bookingHomeChefProfileId: string | null = null;

    if (dto.bookingId) {
      const booking = assertFound(
        await this.prisma.booking.findUnique({ where: { id: dto.bookingId } }),
        'Booking not found',
      );

      if (booking.customerId !== reviewerId) {
        throw new BadRequestException('You can only review your own bookings');
      }

      if (booking.status !== 'COMPLETED' && booking.status !== 'CONFIRMED') {
        throw new BadRequestException('Booking must be confirmed or completed to review');
      }

      isVerifiedPurchase = true;
      bookingRestaurantId = booking.restaurantId;
      bookingHomeChefProfileId = booking.homeChefProfileId;

      if (
        dto.targetType === 'RESTAURANT' &&
        bookingRestaurantId !== dto.restaurantId
      ) {
        throw new BadRequestException('Review target does not match booking');
      }

      if (
        dto.targetType === 'HOME_CHEF' &&
        bookingHomeChefProfileId !== dto.homeChefProfileId
      ) {
        throw new BadRequestException('Review target does not match booking');
      }

      const existingBookingReview = await this.prisma.review.findUnique({
        where: { bookingId: dto.bookingId },
      });
      if (existingBookingReview) {
        throw new ConflictException('This booking has already been reviewed');
      }
    }

    if (dto.targetType === 'RESTAURANT') {
      assertFound(
        await this.prisma.restaurant.findFirst({
          where: { id: dto.restaurantId, isActive: true },
        }),
        'Restaurant not found',
      );
    } else {
      assertFound(
        await this.prisma.homeChefProfile.findFirst({
          where: { id: dto.homeChefProfileId, isActive: true },
        }),
        'Home chef not found',
      );
    }

    const review = await this.prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          reviewerId,
          targetType: dto.targetType,
          restaurantId: dto.restaurantId,
          homeChefProfileId: dto.homeChefProfileId,
          bookingId: dto.bookingId,
          rating: dto.rating,
          text: dto.text?.trim(),
          isVerifiedPurchase,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              username: true,
              fullName: true,
              profileImage: true,
            },
          },
        },
      });

      if (dto.targetType === 'RESTAURANT' && dto.restaurantId) {
        await recalculateRestaurantRating(tx, dto.restaurantId);
      }

      if (dto.targetType === 'HOME_CHEF' && dto.homeChefProfileId) {
        await recalculateHomeChefRating(tx, dto.homeChefProfileId);
      }

      return created;
    });

    if (dto.targetType === 'RESTAURANT' && dto.restaurantId) {
      await this.rankingService.refreshRestaurantRank(dto.restaurantId);
    }

    return this.toReviewDto(review);
  }

  async listReviews(query: ReviewsQueryDto): Promise<ReviewsListResponseDto> {
    if (!query.restaurantId && !query.homeChefProfileId) {
      throw new BadRequestException('restaurantId or homeChefProfileId is required');
    }

    const where = query.restaurantId
      ? { restaurantId: query.restaurantId }
      : { homeChefProfileId: query.homeChefProfileId };

    const reviews = await this.prisma.review.findMany({
      where,
      include: {
        reviewer: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });

    const hasMore = reviews.length > query.limit;
    const items = hasMore ? reviews.slice(0, query.limit) : reviews;

    return {
      items: items.map((review) => this.toReviewDto(review)),
      nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
      hasMore,
    };
  }

  private toReviewDto(review: ReviewWithAuthor): ReviewDto {
    return {
      id: review.id,
      targetType: review.targetType,
      restaurantId: review.restaurantId,
      homeChefProfileId: review.homeChefProfileId,
      rating: review.rating,
      text: review.text,
      isVerifiedPurchase: review.isVerifiedPurchase,
      author: {
        id: review.reviewer.id,
        username: review.reviewer.username,
        fullName: review.reviewer.fullName,
        profileImage: review.reviewer.profileImage,
      },
      createdAt: review.createdAt.toISOString(),
    };
  }
}
