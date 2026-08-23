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
exports.HomeChefService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const marketplace_utils_1 = require("./marketplace.utils");
let HomeChefService = class HomeChefService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upsertProfile(userId, dto) {
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
    async getMyProfile(userId) {
        const profile = (0, marketplace_utils_1.assertFound)(await this.prisma.homeChefProfile.findUnique({
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
        }), 'Home chef profile not found. Create your profile first.');
        return this.toProfileDto(profile);
    }
    async getProfile(chefProfileId) {
        const profile = (0, marketplace_utils_1.assertFound)(await this.prisma.homeChefProfile.findFirst({
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
        }), 'Home chef not found');
        return this.toProfileDto(profile);
    }
    async createMenuItem(userId, dto) {
        const profile = (0, marketplace_utils_1.assertFound)(await this.prisma.homeChefProfile.findUnique({ where: { userId } }), 'Home chef profile not found. Create your profile first.');
        if (!profile.acceptsOrders || !profile.isActive) {
            throw new common_1.BadRequestException('Home chef is not accepting orders');
        }
        const availableDate = (0, marketplace_utils_1.parseDateOnly)(dto.availableDate, 'availableDate');
        (0, marketplace_utils_1.assertFutureDate)(availableDate, 'availableDate');
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
    async listMenuItems(query) {
        const where = { isActive: true };
        if (query.chefId) {
            where.homeChefProfileId = query.chefId;
        }
        if (query.date) {
            where.availableDate = (0, marketplace_utils_1.parseDateOnly)(query.date, 'date');
        }
        const items = await this.prisma.homeChefMenuItem.findMany({
            where,
            orderBy: [{ availableDate: 'asc' }, { name: 'asc' }],
            take: 100,
        });
        return items.map((item) => this.toMenuItemDto(item));
    }
    async listHomeChefs() {
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
    validateAvailability(availability) {
        if (!availability?.length) {
            return;
        }
        for (const slot of availability) {
            (0, marketplace_utils_1.assertValidTime)(slot.startTime, 'startTime');
            (0, marketplace_utils_1.assertValidTime)(slot.endTime, 'endTime');
        }
    }
    toMenuItemDto(item) {
        return {
            id: item.id,
            name: item.name,
            description: item.description,
            price: (0, marketplace_utils_1.decimalToNumber)(item.price),
            currency: item.currency,
            imageUrl: item.imageUrl,
            availableDate: item.availableDate.toISOString().slice(0, 10),
            servingsAvailable: item.servingsAvailable,
            servingsRemaining: item.servingsAvailable - item.servingsSold,
            isActive: item.isActive,
        };
    }
    toProfileDto(profile) {
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
};
exports.HomeChefService = HomeChefService;
exports.HomeChefService = HomeChefService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HomeChefService);
//# sourceMappingURL=home-chef.service.js.map