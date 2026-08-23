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
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const monetization_service_1 = require("../growth/monetization.service");
const marketplace_utils_1 = require("./marketplace.utils");
let BookingsService = class BookingsService {
    prisma;
    monetizationService;
    constructor(prisma, monetizationService) {
        this.prisma = prisma;
        this.monetizationService = monetizationService;
    }
    async createBooking(customerId, dto) {
        (0, marketplace_utils_1.assertValidTime)(dto.bookingTime, 'bookingTime');
        const bookingDate = (0, marketplace_utils_1.parseDateOnly)(dto.bookingDate, 'bookingDate');
        (0, marketplace_utils_1.assertFutureDate)(bookingDate, 'bookingDate');
        if (dto.type === 'RESTAURANT_TABLE') {
            return this.createRestaurantBooking(customerId, dto, bookingDate);
        }
        return this.createHomeChefBooking(customerId, dto, bookingDate);
    }
    async listMyBookings(userId) {
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
    async updateBookingStatus(userId, bookingId, dto) {
        const booking = (0, marketplace_utils_1.assertFound)(await this.prisma.booking.findUnique({
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
        }), 'Booking not found');
        const isCustomer = booking.customerId === userId;
        const isRestaurantOwner = booking.restaurant?.ownerId === userId;
        const isHomeChef = booking.homeChefProfile?.userId === userId;
        if (dto.status === 'CANCELLED') {
            if (!isCustomer && !isRestaurantOwner && !isHomeChef) {
                throw new common_1.ForbiddenException('Not allowed to cancel this booking');
            }
        }
        else if (!isRestaurantOwner && !isHomeChef) {
            throw new common_1.ForbiddenException('Only the provider can update booking status');
        }
        if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
            throw new common_1.BadRequestException('Booking is already finalized');
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
            if (dto.status === 'CANCELLED' &&
                booking.type === 'HOME_CHEF_MEAL' &&
                booking.homeChefMenuItemId) {
                await tx.homeChefMenuItem.update({
                    where: { id: booking.homeChefMenuItemId },
                    data: { servingsSold: { decrement: booking.quantity } },
                });
            }
            return saved;
        });
        if (dto.status === 'COMPLETED') {
            await this.monetizationService.handleBookingCompleted(bookingId, updated.restaurantId, updated.affiliateReferrerId, (0, marketplace_utils_1.decimalToNumber)(updated.totalPrice));
        }
        return this.toBookingDto(updated);
    }
    async createRestaurantBooking(customerId, dto, bookingDate) {
        if (!dto.restaurantId) {
            throw new common_1.BadRequestException('restaurantId is required for restaurant table bookings');
        }
        if (!dto.partySize || dto.partySize < 1) {
            throw new common_1.BadRequestException('partySize is required for restaurant table bookings');
        }
        const restaurant = (0, marketplace_utils_1.assertFound)(await this.prisma.restaurant.findFirst({
            where: { id: dto.restaurantId, isActive: true },
        }), 'Restaurant not found');
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
    async createHomeChefBooking(customerId, dto, bookingDate) {
        if (!dto.homeChefMenuItemId) {
            throw new common_1.BadRequestException('homeChefMenuItemId is required for home chef meal bookings');
        }
        const quantity = dto.quantity ?? 1;
        const booking = await this.prisma.$transaction(async (tx) => {
            const menuItem = (0, marketplace_utils_1.assertFound)(await tx.homeChefMenuItem.findFirst({
                where: {
                    id: dto.homeChefMenuItemId,
                    isActive: true,
                    homeChefProfile: { isActive: true, acceptsOrders: true },
                },
                include: { homeChefProfile: true },
            }), 'Home chef menu item not found');
            const menuDate = menuItem.availableDate.toISOString().slice(0, 10);
            const requestedDate = bookingDate.toISOString().slice(0, 10);
            if (menuDate !== requestedDate) {
                throw new common_1.BadRequestException('bookingDate must match the menu item available date');
            }
            const remaining = menuItem.servingsAvailable - menuItem.servingsSold;
            if (quantity > remaining) {
                throw new common_1.BadRequestException('Not enough servings available');
            }
            const updatedMenuItem = await tx.homeChefMenuItem.update({
                where: { id: menuItem.id },
                data: { servingsSold: { increment: quantity } },
            });
            if (updatedMenuItem.servingsSold > updatedMenuItem.servingsAvailable) {
                throw new common_1.BadRequestException('Not enough servings available');
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
                    totalPrice: (0, marketplace_utils_1.decimalToNumber)(menuItem.price) * quantity,
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
    toBookingDto(booking) {
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
            totalPrice: (0, marketplace_utils_1.decimalToNumber)(booking.totalPrice),
            currency: booking.currency,
            notes: booking.notes,
            createdAt: booking.createdAt.toISOString(),
        };
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        monetization_service_1.MonetizationService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map