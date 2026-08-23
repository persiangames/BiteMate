"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const node_crypto_1 = require("node:crypto");
const dining_1 = require("../../common/dining");
const prisma_service_1 = require("../database/prisma.service");
const user_mapper_1 = require("../auth/mappers/user.mapper");
const totp_1 = require("../auth/totp");
const qrcode_1 = __importDefault(require("qrcode"));
const location_service_1 = require("../location/location.service");
const rate_limiter_service_1 = require("../redis/rate-limiter.service");
const publicUserSelect = {
    id: true,
    username: true,
    fullName: true,
    bio: true,
    profileImage: true,
    coverImage: true,
    role: true,
    city: true,
    country: true,
    dateOfBirth: true,
    gender: true,
    education: true,
    preferredMeals: true,
    favoriteCuisines: true,
    favoriteFoods: true,
    lookingToEat: true,
    followerCount: true,
    followingCount: true,
};
const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;
const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let UsersService = UsersService_1 = class UsersService {
    prisma;
    locationService;
    configService;
    rateLimiter;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(prisma, locationService, configService, rateLimiter) {
        this.prisma = prisma;
        this.locationService = locationService;
        this.configService = configService;
        this.rateLimiter = rateLimiter;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return (0, user_mapper_1.mapUserToAuthDto)(user);
    }
    async searchUsers(query, limit = 8) {
        const q = query.trim().replace(/^@/, '');
        if (!q) {
            return [];
        }
        return this.prisma.user.findMany({
            where: {
                isActive: true,
                deletedAt: null,
                username: { contains: q, mode: 'insensitive' },
            },
            take: limit,
            orderBy: { username: 'asc' },
            select: {
                id: true,
                username: true,
                fullName: true,
                profileImage: true,
                role: true,
            },
        });
    }
    async getPublicProfile(username, viewerId) {
        const normalized = username.trim().replace(/^@/, '');
        const user = await this.prisma.user.findFirst({
            where: {
                isActive: true,
                deletedAt: null,
                username: { equals: normalized, mode: 'insensitive' },
            },
            select: publicUserSelect,
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.toPublicUser(user, viewerId);
    }
    async getPublicProfileById(userId, viewerId) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, isActive: true, deletedAt: null },
            select: publicUserSelect,
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.toPublicUser(user, viewerId);
    }
    async listMeetupHistory(userId, kind) {
        const exists = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true },
        });
        if (!exists) {
            throw new common_1.NotFoundException('User not found');
        }
        const meetups = kind === 'hosted'
            ? await this.prisma.foodMeetup.findMany({
                where: { creatorId: userId, status: { not: 'CANCELLED' } },
                orderBy: { scheduledAt: 'desc' },
                take: 50,
            })
            : await this.prisma.foodMeetup.findMany({
                where: {
                    status: { not: 'CANCELLED' },
                    creatorId: { not: userId },
                    OR: [
                        { participations: { some: { userId } } },
                        { invites: { some: { inviteeId: userId, status: 'ACCEPTED' } } },
                    ],
                },
                orderBy: { scheduledAt: 'desc' },
                take: 50,
            });
        const items = await Promise.all(meetups.map((meetup) => this.toHistoryEvent(meetup, kind === 'hosted' ? 'HOST' : 'GUEST')));
        return { items };
    }
    async toPublicUser(user, viewerId) {
        const [isFollowing, hostedMeetupCount, attendedMeetupCount] = await Promise.all([
            viewerId && viewerId !== user.id
                ? this.prisma.follow
                    .findUnique({
                    where: { followerId_followingId: { followerId: viewerId, followingId: user.id } },
                    select: { id: true },
                })
                    .then((row) => Boolean(row))
                : Promise.resolve(false),
            this.prisma.foodMeetup.count({
                where: { creatorId: user.id, status: { not: 'CANCELLED' } },
            }),
            this.prisma.foodMeetup.count({
                where: {
                    status: { not: 'CANCELLED' },
                    creatorId: { not: user.id },
                    OR: [
                        { participations: { some: { userId: user.id } } },
                        { invites: { some: { inviteeId: user.id, status: 'ACCEPTED' } } },
                    ],
                },
            }),
        ]);
        return {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            bio: user.bio,
            profileImage: user.profileImage,
            coverImage: user.coverImage,
            role: user.role,
            city: user.city,
            country: user.country,
            followerCount: user.followerCount,
            followingCount: user.followingCount,
            isFollowing,
            hostedMeetupCount,
            attendedMeetupCount,
            age: (0, dining_1.ageFromDateOfBirth)(user.dateOfBirth),
            gender: user.gender ?? null,
            education: user.education ?? null,
            preferredMeals: (user.preferredMeals ?? []),
            favoriteCuisines: user.favoriteCuisines ?? [],
            favoriteFoods: user.favoriteFoods ?? [],
            lookingToEat: user.lookingToEat ?? false,
        };
    }
    async toHistoryEvent(meetup, role) {
        const [reviews, participations, acceptedInvites, restaurant] = await Promise.all([
            this.prisma.meetupReview.aggregate({
                where: { meetupId: meetup.id },
                _avg: { rating: true },
                _count: { _all: true },
            }),
            this.prisma.meetupParticipation.count({ where: { meetupId: meetup.id } }),
            this.prisma.meetupInvite.count({
                where: { meetupId: meetup.id, status: 'ACCEPTED' },
            }),
            meetup.locationLabel
                ? this.prisma.restaurant.findFirst({
                    where: {
                        isActive: true,
                        name: { equals: meetup.locationLabel, mode: 'insensitive' },
                    },
                    select: { id: true, name: true },
                })
                : Promise.resolve(null),
        ]);
        const attendeeCount = Math.max(participations, acceptedInvites + 1, 1);
        const label = meetup.locationLabel ?? '';
        const isHome = /خانه|home|house|منزل/i.test(label);
        const rating = Math.min(5, Math.max(0, reviews._avg.rating ?? 0));
        return {
            id: meetup.id,
            foodType: meetup.foodType,
            scheduledAt: meetup.scheduledAt.toISOString(),
            locationLabel: meetup.locationLabel,
            venueKind: restaurant ? 'RESTAURANT' : isHome ? 'HOME' : 'OTHER',
            restaurantId: restaurant?.id ?? null,
            restaurantName: restaurant?.name ?? null,
            attendeeCount,
            rating: Math.round(rating * 10) / 10,
            reviewCount: reviews._count._all,
            role,
        };
    }
    async isUsernameAvailable(username, exceptUserId) {
        const normalized = username.trim().toLowerCase();
        if (!USERNAME_PATTERN.test(normalized)) {
            return { username: normalized, available: false };
        }
        const existing = await this.prisma.user.findFirst({
            where: {
                username: { equals: normalized, mode: 'insensitive' },
                ...(exceptUserId ? { NOT: { id: exceptUserId } } : {}),
            },
            select: { id: true },
        });
        return { username: normalized, available: !existing };
    }
    async updateProfile(userId, dto) {
        if (dto.username) {
            const availability = await this.isUsernameAvailable(dto.username, userId);
            if (!availability.available) {
                throw new common_1.ConflictException('This username is already taken');
            }
        }
        try {
            const user = await this.prisma.user.update({
                where: { id: userId },
                data: {
                    fullName: dto.fullName,
                    username: dto.username,
                    bio: dto.bio,
                    country: dto.country,
                    city: dto.city,
                    dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
                    role: dto.role,
                    profileImage: dto.profileImage,
                    coverImage: dto.coverImage,
                    locale: dto.locale,
                    liveLocationEnabled: dto.liveLocationEnabled,
                    invisibleMode: dto.invisibleMode,
                    availabilityStatus: dto.invisibleMode
                        ? 'OFFLINE'
                        : dto.availabilityStatus,
                    liveLatitude: dto.liveLatitude,
                    liveLongitude: dto.liveLongitude,
                    lastLiveLocationAt: dto.liveLatitude != null && dto.liveLongitude != null
                        ? new Date()
                        : undefined,
                    gender: dto.gender,
                    education: dto.education,
                    preferredMeals: dto.preferredMeals,
                    favoriteCuisines: dto.favoriteCuisines,
                    favoriteFoods: dto.favoriteFoods,
                    lookingToEat: dto.lookingToEat,
                },
            });
            await this.locationService.syncRedisIndex(user);
            return (0, user_mapper_1.mapUserToAuthDto)(user);
        }
        catch (error) {
            this.throwUniqueConflict(error);
            throw error;
        }
    }
    async requestContactChange(userId, dto) {
        const destination = this.normalizeDestination(dto.channel, dto.value);
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (dto.channel === 'email' && user.email?.toLowerCase() === destination) {
            throw new common_1.BadRequestException('That is already your current email');
        }
        if (dto.channel === 'phone' && user.phoneNumber === destination) {
            throw new common_1.BadRequestException('That is already your current phone number');
        }
        await this.assertDestinationFree(dto.channel, destination, userId);
        const limit = await this.rateLimiter.consume('contact-otp', `${userId}:${dto.channel}`, 5, 3600);
        if (!limit.allowed) {
            throw new common_1.BadRequestException(`Too many verification requests. Try again in ${limit.retryAfterSeconds} seconds.`);
        }
        const purpose = dto.channel === 'email' ? client_1.OtpPurpose.EMAIL_CHANGE : client_1.OtpPurpose.PHONE_CHANGE;
        const code = (0, node_crypto_1.randomInt)(100000, 999999).toString();
        const codeHash = await bcrypt.hash(code, 10);
        const expiresInSeconds = this.configService.get('otp.expiresInSeconds', 300);
        await this.prisma.otpCode.updateMany({
            where: { phoneNumber: destination, purpose, verified: false },
            data: { verified: true },
        });
        await this.prisma.otpCode.create({
            data: {
                userId,
                phoneNumber: destination,
                codeHash,
                purpose,
                expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
            },
        });
        this.logger.log(`Contact change OTP for ${dto.channel} ${destination} (user ${userId})`);
        const nodeEnv = this.configService.get('app.nodeEnv', 'development');
        const response = {
            message: dto.channel === 'email'
                ? 'Verification code sent to your email'
                : 'Verification code sent to your phone',
            expiresInSeconds,
        };
        if (nodeEnv !== 'production') {
            response.devCode = code;
            this.logger.warn(`DEV contact OTP for ${destination}: ${code}`);
        }
        return response;
    }
    async verifyContactChange(userId, dto) {
        const destination = this.normalizeDestination(dto.channel, dto.value);
        const purpose = dto.channel === 'email' ? client_1.OtpPurpose.EMAIL_CHANGE : client_1.OtpPurpose.PHONE_CHANGE;
        const otp = await this.prisma.otpCode.findFirst({
            where: {
                userId,
                phoneNumber: destination,
                purpose,
                verified: false,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!otp) {
            throw new common_1.BadRequestException('Verification code expired or not found');
        }
        const maxAttempts = this.configService.get('otp.maxAttempts', 5);
        if (otp.attempts >= maxAttempts) {
            throw new common_1.BadRequestException('Maximum verification attempts exceeded');
        }
        const valid = await bcrypt.compare(dto.code, otp.codeHash);
        if (!valid) {
            await this.prisma.otpCode.update({
                where: { id: otp.id },
                data: { attempts: { increment: 1 } },
            });
            throw new common_1.BadRequestException('Invalid verification code');
        }
        await this.assertDestinationFree(dto.channel, destination, userId);
        await this.prisma.otpCode.update({
            where: { id: otp.id },
            data: { verified: true },
        });
        try {
            const user = await this.prisma.user.update({
                where: { id: userId },
                data: dto.channel === 'email'
                    ? { email: destination, emailVerified: true }
                    : {
                        phoneNumber: destination,
                        phoneVerified: true,
                        otpVerified: true,
                    },
            });
            return (0, user_mapper_1.mapUserToAuthDto)(user);
        }
        catch (error) {
            this.throwUniqueConflict(error);
            throw error;
        }
    }
    async updateLocale(userId, dto) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { locale: dto.locale },
        });
        return (0, user_mapper_1.mapUserToAuthDto)(user);
    }
    normalizeDestination(channel, value) {
        const trimmed = value.trim();
        if (channel === 'email') {
            const email = trimmed.toLowerCase();
            if (!EMAIL_PATTERN.test(email)) {
                throw new common_1.BadRequestException('Enter a valid email address');
            }
            return email;
        }
        if (!PHONE_PATTERN.test(trimmed)) {
            throw new common_1.BadRequestException('Enter a valid phone number with country code, like +989121234567');
        }
        return trimmed;
    }
    async assertDestinationFree(channel, destination, userId) {
        const existing = await this.prisma.user.findFirst({
            where: channel === 'email'
                ? { email: { equals: destination, mode: 'insensitive' }, NOT: { id: userId } }
                : { phoneNumber: destination, NOT: { id: userId } },
            select: { id: true },
        });
        if (existing) {
            throw new common_1.ConflictException(channel === 'email'
                ? 'This email is already used by another account'
                : 'This phone number is already used by another account');
        }
    }
    throwUniqueConflict(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002') {
            const target = Array.isArray(error.meta?.target)
                ? error.meta.target.join(',')
                : String(error.meta?.target ?? '');
            if (target.includes('username')) {
                throw new common_1.ConflictException('This username is already taken');
            }
            if (target.includes('email')) {
                throw new common_1.ConflictException('This email is already used by another account');
            }
            if (target.includes('phone')) {
                throw new common_1.ConflictException('This phone number is already used by another account');
            }
            throw new common_1.ConflictException('That value is already taken');
        }
    }
    async setupTwoFactor(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const secret = (0, totp_1.generateTotpSecret)();
        await this.prisma.user.update({
            where: { id: userId },
            data: { totpSecret: secret, totpEnabled: false },
        });
        const account = user.email || user.phoneNumber || user.username || userId;
        const otpauthUrl = (0, totp_1.buildOtpAuthUrl)(account, secret);
        const qrDataUrl = await qrcode_1.default.toDataURL(otpauthUrl);
        return { otpauthUrl, qrDataUrl, secret };
    }
    async enableTwoFactor(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.totpSecret) {
            throw new common_1.BadRequestException('Start authenticator setup first');
        }
        if (!(0, totp_1.verifyTotpCode)(user.totpSecret, dto.code)) {
            throw new common_1.BadRequestException('Invalid authenticator code');
        }
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { totpEnabled: true },
        });
        return (0, user_mapper_1.mapUserToAuthDto)(updated);
    }
    async disableTwoFactor(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.passwordHash) {
            throw new common_1.BadRequestException('Password is required');
        }
        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        if (!user.totpSecret || !(0, totp_1.verifyTotpCode)(user.totpSecret, dto.code)) {
            throw new common_1.BadRequestException('Invalid authenticator code');
        }
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { totpEnabled: false, totpSecret: null },
        });
        return (0, user_mapper_1.mapUserToAuthDto)(updated);
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.passwordHash) {
            throw new common_1.BadRequestException('Password login is not available for this account');
        }
        const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!valid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const passwordHash = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash, tokenVersion: { increment: 1 } },
        });
        return { message: 'Password updated. Please log in again.' };
    }
    async updateTheme(userId, dto) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { themePreference: dto.theme },
        });
        return (0, user_mapper_1.mapUserToAuthDto)(user);
    }
    async requestAccountDeletion(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.passwordHash) {
            throw new common_1.BadRequestException('Password is required');
        }
        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const destination = dto.channel === 'email' ? user.email : user.phoneNumber;
        if (!destination) {
            throw new common_1.BadRequestException(`No ${dto.channel} is registered on this account`);
        }
        const code = (0, node_crypto_1.randomInt)(100000, 999999).toString();
        const codeHash = await bcrypt.hash(code, 10);
        const expiresInSeconds = this.configService.get('otp.expiresInSeconds', 300);
        await this.prisma.otpCode.updateMany({
            where: { userId, purpose: client_1.OtpPurpose.ACCOUNT_DELETE, verified: false },
            data: { verified: true },
        });
        await this.prisma.otpCode.create({
            data: {
                userId,
                phoneNumber: destination,
                codeHash,
                purpose: client_1.OtpPurpose.ACCOUNT_DELETE,
                expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
            },
        });
        const nodeEnv = this.configService.get('app.nodeEnv', 'development');
        const response = {
            message: 'Verification code sent to confirm account deletion',
            expiresInSeconds,
        };
        if (nodeEnv !== 'production') {
            response.devCode = code;
            this.logger.warn(`DEV delete-account OTP for ${destination}: ${code}`);
        }
        return response;
    }
    async confirmAccountDeletion(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const destination = dto.channel === 'email' ? user.email : user.phoneNumber;
        if (!destination) {
            throw new common_1.BadRequestException(`No ${dto.channel} is registered on this account`);
        }
        const otp = await this.prisma.otpCode.findFirst({
            where: {
                userId,
                phoneNumber: destination,
                purpose: client_1.OtpPurpose.ACCOUNT_DELETE,
                verified: false,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!otp) {
            throw new common_1.BadRequestException('Verification code expired or not found');
        }
        const valid = await bcrypt.compare(dto.code, otp.codeHash);
        if (!valid) {
            await this.prisma.otpCode.update({
                where: { id: otp.id },
                data: { attempts: { increment: 1 } },
            });
            throw new common_1.BadRequestException('Invalid verification code');
        }
        await this.prisma.otpCode.update({ where: { id: otp.id }, data: { verified: true } });
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                isActive: false,
                deletedAt: new Date(),
                tokenVersion: { increment: 1 },
            },
        });
        await this.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return { message: 'Your account has been deleted' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        location_service_1.LocationService,
        config_1.ConfigService,
        rate_limiter_service_1.RateLimiterService])
], UsersService);
//# sourceMappingURL=users.service.js.map