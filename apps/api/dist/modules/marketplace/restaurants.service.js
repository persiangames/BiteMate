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
exports.RestaurantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const ranking_service_1 = require("../growth/ranking.service");
const marketplace_utils_1 = require("./marketplace.utils");
let RestaurantsService = class RestaurantsService {
    prisma;
    rankingService;
    constructor(prisma, rankingService) {
        this.prisma = prisma;
        this.rankingService = rankingService;
    }
    async createRestaurant(ownerId, dto) {
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
    async listRestaurants(query) {
        const where = {
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
    async getRestaurant(restaurantId, visitorId) {
        const restaurant = (0, marketplace_utils_1.assertFound)(await this.prisma.restaurant.findFirst({
            where: { id: restaurantId, isActive: true, approvalStatus: 'APPROVED' },
            include: {
                openingHours: { orderBy: { dayOfWeek: 'asc' } },
                menuItems: {
                    where: { isAvailable: true },
                    orderBy: [{ category: 'asc' }, { name: 'asc' }],
                },
            },
        }), 'Restaurant not found');
        void this.rankingService.recordRestaurantVisit(restaurantId, visitorId);
        return this.toRestaurantDto(restaurant);
    }
    async addMenuItem(ownerId, restaurantId, dto) {
        const restaurant = (0, marketplace_utils_1.assertFound)(await this.prisma.restaurant.findUnique({ where: { id: restaurantId } }), 'Restaurant not found');
        (0, marketplace_utils_1.assertOwner)(ownerId, restaurant.ownerId, 'Only the restaurant owner can add menu items');
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
    validateOpeningHours(openingHours) {
        if (!openingHours?.length) {
            return;
        }
        for (const hour of openingHours) {
            if (!hour.isClosed) {
                (0, marketplace_utils_1.assertValidTime)(hour.openTime, 'openTime');
                (0, marketplace_utils_1.assertValidTime)(hour.closeTime, 'closeTime');
            }
        }
    }
    toSummaryDto(restaurant) {
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
    toMenuItemDto(item) {
        const price = (0, marketplace_utils_1.decimalToNumber)(item.price);
        return {
            id: item.id,
            name: item.name,
            description: item.description,
            price,
            currency: item.currency,
            category: item.category,
            imageUrl: item.imageUrl,
            discountPercent: item.discountPercent,
            discountedPrice: (0, marketplace_utils_1.discountedPrice)(price, item.discountPercent),
            isAvailable: item.isAvailable,
        };
    }
    toRestaurantDto(restaurant) {
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
};
exports.RestaurantsService = RestaurantsService;
exports.RestaurantsService = RestaurantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ranking_service_1.RankingService])
], RestaurantsService);
//# sourceMappingURL=restaurants.service.js.map