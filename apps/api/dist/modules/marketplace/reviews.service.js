"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const ranking_service_1 = require("../growth/ranking.service");
const marketplace_utils_1 = require("./marketplace.utils");
let ReviewsService = class ReviewsService {
    prisma;
    rankingService;
    constructor(prisma, rankingService) {
        this.prisma = prisma;
        this.rankingService = rankingService;
    }
    async createReview(reviewerId, dto) {
        if (dto.targetType === 'RESTAURANT' && !dto.restaurantId) {
            throw new common_1.BadRequestException('restaurantId is required for restaurant reviews');
        }
        if (dto.targetType === 'HOME_CHEF' && !dto.homeChefProfileId) {
            throw new common_1.BadRequestException('homeChefProfileId is required for home chef reviews');
        }
        let isVerifiedPurchase = false;
        let bookingRestaurantId = null;
        let bookingHomeChefProfileId = null;
        if (dto.bookingId) {
            const booking = (0, marketplace_utils_1.assertFound)(await this.prisma.booking.findUnique({ where: { id: dto.bookingId } }), 'Booking not found');
            if (booking.customerId !== reviewerId) {
                throw new common_1.BadRequestException('You can only review your own bookings');
            }
            if (booking.status !== 'COMPLETED' && booking.status !== 'CONFIRMED') {
                throw new common_1.BadRequestException('Booking must be confirmed or completed to review');
            }
            isVerifiedPurchase = true;
            bookingRestaurantId = booking.restaurantId;
            bookingHomeChefProfileId = booking.homeChefProfileId;
            if (dto.targetType === 'RESTAURANT' &&
                bookingRestaurantId !== dto.restaurantId) {
                throw new common_1.BadRequestException('Review target does not match booking');
            }
            if (dto.targetType === 'HOME_CHEF' &&
                bookingHomeChefProfileId !== dto.homeChefProfileId) {
                throw new common_1.BadRequestException('Review target does not match booking');
            }
            const existingBookingReview = await this.prisma.review.findUnique({
                where: { bookingId: dto.bookingId },
            });
            if (existingBookingReview) {
                throw new common_1.ConflictException('This booking has already been reviewed');
            }
        }
        if (dto.targetType === 'RESTAURANT') {
            (0, marketplace_utils_1.assertFound)(await this.prisma.restaurant.findFirst({
                where: { id: dto.restaurantId, isActive: true },
            }), 'Restaurant not found');
        }
        else {
            (0, marketplace_utils_1.assertFound)(await this.prisma.homeChefProfile.findFirst({
                where: { id: dto.homeChefProfileId, isActive: true },
            }), 'Home chef not found');
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
                await (0, marketplace_utils_1.recalculateRestaurantRating)(tx, dto.restaurantId);
            }
            if (dto.targetType === 'HOME_CHEF' && dto.homeChefProfileId) {
                await (0, marketplace_utils_1.recalculateHomeChefRating)(tx, dto.homeChefProfileId);
            }
            return created;
        });
        if (dto.targetType === 'RESTAURANT' && dto.restaurantId) {
            await this.rankingService.refreshRestaurantRank(dto.restaurantId);
        }
        return this.toReviewDto(review);
    }
    async listReviews(query) {
        if (!query.restaurantId && !query.homeChefProfileId) {
            throw new common_1.BadRequestException('restaurantId or homeChefProfileId is required');
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
    toReviewDto(review) {
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
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ranking_service_1.RankingService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map