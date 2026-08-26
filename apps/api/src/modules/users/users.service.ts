import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OtpPurpose, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'node:crypto';
import type {
  AuthUserDto,
  EducationLevel,
  Gender,
  MealSlot,
  OtpRequestResponseDto,
  ProfileMeetupEventDto,
  ProfileMeetupHistoryDto,
  PublicUserDto,
  UsernameAvailableResponseDto,
  UserSearchHitDto,
} from '@bitemate/shared';
import { ageFromDateOfBirth } from '../../common/dining';
import { PrismaService } from '../database/prisma.service';
import { mapUserToAuthDto } from '../auth/mappers/user.mapper';
import { buildOtpAuthUrl, generateTotpSecret, verifyTotpCode } from '../auth/totp';
import QRCode from 'qrcode';
import type {
  ChangePasswordDto,
  DeleteAccountConfirmDto,
  DeleteAccountRequestDto,
  DisableTwoFactorDto,
  EnableTwoFactorDto,
  RequestContactChangeDto,
  UpdateLocaleDto,
  UpdateProfileDto,
  UpdateThemeDto,
  VerifyContactChangeDto,
} from '../auth/dto/auth.dto';
import { LocationService } from '../location/location.service';
import { MessagingService } from '../messaging/messaging.service';
import { RateLimiterService } from '../redis/rate-limiter.service';

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
} as const;

const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;
const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly locationService: LocationService,
    private readonly configService: ConfigService,
    private readonly rateLimiter: RateLimiterService,
    private readonly messagingService: MessagingService,
  ) {}

  async getProfile(userId: string): Promise<AuthUserDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return mapUserToAuthDto(user);
  }

  async searchUsers(query: string, limit = 8): Promise<UserSearchHitDto[]> {
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

  async getPublicProfile(username: string, viewerId?: string): Promise<PublicUserDto> {
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
      throw new NotFoundException('User not found');
    }
    return this.toPublicUser(user, viewerId);
  }

  async getPublicProfileById(userId: string, viewerId?: string): Promise<PublicUserDto> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, isActive: true, deletedAt: null },
      select: publicUserSelect,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toPublicUser(user, viewerId);
  }

  async listMeetupHistory(
    userId: string,
    kind: 'hosted' | 'attended',
  ): Promise<ProfileMeetupHistoryDto> {
    const exists = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException('User not found');
    }

    const meetups =
      kind === 'hosted'
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

    const items = await Promise.all(
      meetups.map((meetup) => this.toHistoryEvent(meetup, kind === 'hosted' ? 'HOST' : 'GUEST')),
    );
    return { items };
  }

  private async toPublicUser(
    user: {
      id: string;
      username: string | null;
      fullName: string | null;
      bio: string | null;
      profileImage: string | null;
      coverImage: string | null;
      role: PublicUserDto['role'];
      city: string | null;
      country: string | null;
      dateOfBirth?: Date | null;
      gender?: Gender | null;
      education?: EducationLevel | null;
      preferredMeals?: string[];
      favoriteCuisines?: string[];
      favoriteFoods?: string[];
      lookingToEat?: boolean;
      followerCount: number;
      followingCount: number;
    },
    viewerId?: string,
  ): Promise<PublicUserDto> {
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
      age: ageFromDateOfBirth(user.dateOfBirth),
      gender: user.gender ?? null,
      education: user.education ?? null,
      preferredMeals: (user.preferredMeals ?? []) as MealSlot[],
      favoriteCuisines: user.favoriteCuisines ?? [],
      favoriteFoods: user.favoriteFoods ?? [],
      lookingToEat: user.lookingToEat ?? false,
    };
  }

  private async toHistoryEvent(
    meetup: {
      id: string;
      foodType: string;
      scheduledAt: Date;
      locationLabel: string | null;
      creatorId: string;
    },
    role: 'HOST' | 'GUEST',
  ): Promise<ProfileMeetupEventDto> {
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

  async isUsernameAvailable(
    username: string,
    exceptUserId?: string,
  ): Promise<UsernameAvailableResponseDto> {
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

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<AuthUserDto> {
    if (dto.username) {
      const availability = await this.isUsernameAvailable(dto.username, userId);
      if (!availability.available) {
        throw new ConflictException('This username is already taken');
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
          lastLiveLocationAt:
            dto.liveLatitude != null && dto.liveLongitude != null
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
      return mapUserToAuthDto(user);
    } catch (error) {
      this.throwUniqueConflict(error);
      throw error;
    }
  }

  async requestContactChange(
    userId: string,
    dto: RequestContactChangeDto,
  ): Promise<OtpRequestResponseDto> {
    const destination = this.normalizeDestination(dto.channel, dto.value);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.channel === 'email' && user.email?.toLowerCase() === destination) {
      throw new BadRequestException('That is already your current email');
    }
    if (dto.channel === 'phone' && user.phoneNumber === destination) {
      throw new BadRequestException('That is already your current phone number');
    }

    await this.assertDestinationFree(dto.channel, destination, userId);

    const limit = await this.rateLimiter.consume(
      'contact-otp',
      `${userId}:${dto.channel}`,
      5,
      3600,
    );
    if (!limit.allowed) {
      throw new BadRequestException(
        `Too many verification requests. Try again in ${limit.retryAfterSeconds} seconds.`,
      );
    }

    const purpose =
      dto.channel === 'email' ? OtpPurpose.EMAIL_CHANGE : OtpPurpose.PHONE_CHANGE;
    const code = randomInt(100000, 999999).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresInSeconds = this.configService.get<number>(
      'otp.expiresInSeconds',
      300,
    );

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

    try {
      await this.messagingService.sendOtp(
        destination,
        code,
        dto.channel === 'email' ? 'email change' : 'phone change',
      );
    } catch (error) {
      this.logger.error(`Failed to send contact-change OTP to ${destination}`, error);
    }

    const response: OtpRequestResponseDto = {
      message:
        dto.channel === 'email'
          ? 'Verification code sent to your email'
          : 'Verification code sent to your phone',
      expiresInSeconds,
    };

    if (this.messagingService.isConsoleOnly()) {
      response.devCode = code;
    }

    return response;
  }

  async verifyContactChange(
    userId: string,
    dto: VerifyContactChangeDto,
  ): Promise<AuthUserDto> {
    const destination = this.normalizeDestination(dto.channel, dto.value);
    const purpose =
      dto.channel === 'email' ? OtpPurpose.EMAIL_CHANGE : OtpPurpose.PHONE_CHANGE;

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
      throw new BadRequestException('Verification code expired or not found');
    }

    const maxAttempts = this.configService.get<number>('otp.maxAttempts', 5);
    if (otp.attempts >= maxAttempts) {
      throw new BadRequestException('Maximum verification attempts exceeded');
    }

    const valid = await bcrypt.compare(dto.code, otp.codeHash);
    if (!valid) {
      await this.prisma.otpCode.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Invalid verification code');
    }

    await this.assertDestinationFree(dto.channel, destination, userId);

    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { verified: true },
    });

    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data:
          dto.channel === 'email'
            ? { email: destination, emailVerified: true }
            : {
                phoneNumber: destination,
                phoneVerified: true,
                otpVerified: true,
              },
      });
      return mapUserToAuthDto(user);
    } catch (error) {
      this.throwUniqueConflict(error);
      throw error;
    }
  }

  async updateLocale(
    userId: string,
    dto: UpdateLocaleDto,
  ): Promise<AuthUserDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { locale: dto.locale },
    });

    return mapUserToAuthDto(user);
  }

  private normalizeDestination(channel: 'email' | 'phone', value: string): string {
    const trimmed = value.trim();
    if (channel === 'email') {
      const email = trimmed.toLowerCase();
      if (!EMAIL_PATTERN.test(email)) {
        throw new BadRequestException('Enter a valid email address');
      }
      return email;
    }
    if (!PHONE_PATTERN.test(trimmed)) {
      throw new BadRequestException('Enter a valid phone number with country code, like +989121234567');
    }
    return trimmed;
  }

  private async assertDestinationFree(
    channel: 'email' | 'phone',
    destination: string,
    userId: string,
  ): Promise<void> {
    const existing = await this.prisma.user.findFirst({
      where:
        channel === 'email'
          ? { email: { equals: destination, mode: 'insensitive' }, NOT: { id: userId } }
          : { phoneNumber: destination, NOT: { id: userId } },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(
        channel === 'email'
          ? 'This email is already used by another account'
          : 'This phone number is already used by another account',
      );
    }
  }

  private throwUniqueConflict(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(',')
        : String(error.meta?.target ?? '');
      if (target.includes('username')) {
        throw new ConflictException('This username is already taken');
      }
      if (target.includes('email')) {
        throw new ConflictException('This email is already used by another account');
      }
      if (target.includes('phone')) {
        throw new ConflictException('This phone number is already used by another account');
      }
      throw new ConflictException('That value is already taken');
    }
  }

  async setupTwoFactor(userId: string): Promise<{ otpauthUrl: string; qrDataUrl: string; secret: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const secret = generateTotpSecret();
    await this.prisma.user.update({
      where: { id: userId },
      data: { totpSecret: secret, totpEnabled: false },
    });
    const account = user.email || user.phoneNumber || user.username || userId;
    const otpauthUrl = buildOtpAuthUrl(account, secret);
    const qrDataUrl = await QRCode.toDataURL(otpauthUrl);
    return { otpauthUrl, qrDataUrl, secret };
  }

  async enableTwoFactor(userId: string, dto: EnableTwoFactorDto): Promise<AuthUserDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.totpSecret) {
      throw new BadRequestException('Start authenticator setup first');
    }
    if (!verifyTotpCode(user.totpSecret, dto.code)) {
      throw new BadRequestException('Invalid authenticator code');
    }
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { totpEnabled: true },
    });
    return mapUserToAuthDto(updated);
  }

  async disableTwoFactor(userId: string, dto: DisableTwoFactorDto): Promise<AuthUserDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) {
      throw new BadRequestException('Password is required');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    if (!user.totpSecret || !verifyTotpCode(user.totpSecret, dto.code)) {
      throw new BadRequestException('Invalid authenticator code');
    }
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { totpEnabled: false, totpSecret: null },
    });
    return mapUserToAuthDto(updated);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) {
      throw new BadRequestException('Password login is not available for this account');
    }
    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, tokenVersion: { increment: 1 } },
    });
    return { message: 'Password updated. Please log in again.' };
  }

  async updateTheme(userId: string, dto: UpdateThemeDto): Promise<AuthUserDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { themePreference: dto.theme },
    });
    return mapUserToAuthDto(user);
  }

  async requestAccountDeletion(
    userId: string,
    dto: DeleteAccountRequestDto,
  ): Promise<OtpRequestResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) {
      throw new BadRequestException('Password is required');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    const destination = dto.channel === 'email' ? user.email : user.phoneNumber;
    if (!destination) {
      throw new BadRequestException(`No ${dto.channel} is registered on this account`);
    }

    const code = randomInt(100000, 999999).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresInSeconds = this.configService.get<number>('otp.expiresInSeconds', 300);
    await this.prisma.otpCode.updateMany({
      where: { userId, purpose: OtpPurpose.ACCOUNT_DELETE, verified: false },
      data: { verified: true },
    });
    await this.prisma.otpCode.create({
      data: {
        userId,
        phoneNumber: destination,
        codeHash,
        purpose: OtpPurpose.ACCOUNT_DELETE,
        expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
      },
    });

    try {
      await this.messagingService.sendOtp(destination, code, 'account deletion');
    } catch (error) {
      this.logger.error(`Failed to send delete-account OTP to ${destination}`, error);
    }

    const response: OtpRequestResponseDto = {
      message: 'Verification code sent to confirm account deletion',
      expiresInSeconds,
    };
    if (this.messagingService.isConsoleOnly()) {
      response.devCode = code;
    }
    return response;
  }

  async confirmAccountDeletion(
    userId: string,
    dto: DeleteAccountConfirmDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const destination = dto.channel === 'email' ? user.email : user.phoneNumber;
    if (!destination) {
      throw new BadRequestException(`No ${dto.channel} is registered on this account`);
    }
    const otp = await this.prisma.otpCode.findFirst({
      where: {
        userId,
        phoneNumber: destination,
        purpose: OtpPurpose.ACCOUNT_DELETE,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp) {
      throw new BadRequestException('Verification code expired or not found');
    }
    const valid = await bcrypt.compare(dto.code, otp.codeHash);
    if (!valid) {
      await this.prisma.otpCode.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Invalid verification code');
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
}
