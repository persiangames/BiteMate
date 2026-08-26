import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  AuthProvider,
  OtpPurpose,
  type User,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, randomInt, randomUUID } from 'node:crypto';
import type {
  AuthResponseDto,
  FirebaseAuthRequestDto,
  ForgotPasswordRequestDto,
  LoginRequestDto,
  MessageResponseDto,
  OtpLoginRequestDto,
  OtpLoginVerifyDto,
  OtpRequestResponseDto,
  RegisterRequestDto,
  ResetPasswordRequestDto,
  UsernameAvailableResponseDto,
  VerifyOtpRequestDto,
} from '@bitemate/shared';
import {
  MIN_SIGNUP_AGE,
  isOldEnough,
  isValidUsername,
  normalizeLoginIdentifier,
  normalizeUsername,
} from '@bitemate/shared';
import { PrismaService } from '../database/prisma.service';
import { RateLimiterService } from '../redis/rate-limiter.service';
import { FraudDetectionService } from '../security/fraud-detection.service';
import { FirebaseService } from './firebase.service';
import { MessagingService } from '../messaging/messaging.service';
import { mapUserToAuthDto } from './mappers/user.mapper';
import { verifyTotpCode } from './totp';
import type { JwtPayload } from './types/jwt-payload.type';

export interface AuthRequestContext {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly firebaseService: FirebaseService,
    private readonly messagingService: MessagingService,
    private readonly rateLimiter: RateLimiterService,
    private readonly fraudDetection: FraudDetectionService,
  ) {}

  async register(
    dto: RegisterRequestDto,
    context: AuthRequestContext = {},
  ): Promise<AuthResponseDto> {
    const email =
      dto.channel === 'email' ? dto.email?.trim().toLowerCase() : undefined;
    const phoneNumber = dto.channel === 'phone' ? dto.phoneNumber?.trim() : undefined;
    if (dto.channel === 'email' && !email) {
      throw new BadRequestException('Email is required');
    }
    if (dto.channel === 'phone' && !phoneNumber) {
      throw new BadRequestException('Phone number is required');
    }

    await this.fraudDetection.assertRegistrationAllowed(email, phoneNumber, context);
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(phoneNumber ? [{ phoneNumber }] : []),
        ],
      },
    });

    if (existing) {
      throw new ConflictException('Email or phone number already registered');
    }

    if (!isOldEnough(dto.dateOfBirth, MIN_SIGNUP_AGE)) {
      throw new BadRequestException(`You must be at least ${MIN_SIGNUP_AGE} years old to sign up`);
    }

    const username = await this.resolveUsernameForRegister(dto.username, dto.fullName);

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        phoneNumber,
        passwordHash,
        fullName: dto.fullName,
        username,
        country: dto.country,
        city: dto.city,
        dateOfBirth: new Date(dto.dateOfBirth),
        role: dto.role,
        profileImage: dto.profileImage,
        locale: dto.locale,
        authProvider: AuthProvider.EMAIL,
        emailVerified: false,
        phoneVerified: false,
        otpVerified: false,
      },
    });

    await this.fraudDetection.inspectNewAccount(user.id, context);

    const destination = email ?? phoneNumber;
    if (destination) {
      void this.createAndSendOtp(
        destination,
        OtpPurpose.PHONE_VERIFICATION,
        user.id,
        'account verification',
        { silentOnDeliveryFailure: true },
      ).catch((error) => {
        this.logger.error(
          `Register OTP could not be sent to ${destination}`,
          error instanceof Error ? error.stack : error,
        );
      });
    }

    return this.buildAuthResponse(user);
  }

  async checkUsernameAvailable(username: string): Promise<UsernameAvailableResponseDto> {
    const normalized = normalizeUsername(username);
    if (!isValidUsername(normalized)) {
      return { username: normalized, available: false };
    }
    const existing = await this.prisma.user.findFirst({
      where: { username: { equals: normalized, mode: 'insensitive' } },
      select: { id: true },
    });
    return { username: normalized, available: !existing };
  }

  async login(
    dto: LoginRequestDto,
    context: AuthRequestContext = {},
  ): Promise<AuthResponseDto> {
    const identifier = normalizeLoginIdentifier(dto.identifier ?? dto.email ?? '');
    if (!identifier) {
      throw new BadRequestException('Email, username, or phone number is required');
    }
    await this.assertLoginNotLocked(identifier, context.ipAddress);

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
          { phoneNumber: identifier },
        ],
      },
    });

    if (!user?.passwordHash) {
      await this.recordFailedLogin(identifier, context.ipAddress);
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      await this.recordFailedLogin(identifier, context.ipAddress);
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    await this.rateLimiter.reset('login-fail', this.loginKey(identifier, context.ipAddress));
    let hydrated = await this.maybePromoteBootstrapAdmin(user);
    if (dto.locale && dto.locale !== hydrated.locale) {
      hydrated = await this.prisma.user.update({
        where: { id: hydrated.id },
        data: { locale: dto.locale },
      });
    }

    if (hydrated.totpEnabled && hydrated.totpSecret) {
      const issuer = this.configService.get<string>('jwt.issuer', 'bitemate')!;
      const audience = this.configService.get<string>('jwt.audience', 'bitemate-app')!;
      const challengeToken = await this.jwtService.signAsync(
        { sub: hydrated.id, purpose: '2fa', jti: randomUUID() },
        { expiresIn: '5m', issuer, audience },
      );
      return {
        user: mapUserToAuthDto(hydrated),
        tokens: { accessToken: '', refreshToken: '', expiresIn: 0 },
        twoFactorRequired: true,
        challengeToken,
      };
    }

    return this.buildAuthResponse(hydrated);
  }

  async verifyTwoFactorLogin(challengeToken: string, code: string): Promise<AuthResponseDto> {
    const issuer = this.configService.get<string>('jwt.issuer', 'bitemate')!;
    const audience = this.configService.get<string>('jwt.audience', 'bitemate-app')!;
    let payload: { sub?: string; purpose?: string };
    try {
      payload = await this.jwtService.verifyAsync(challengeToken, { issuer, audience });
    } catch {
      throw new UnauthorizedException('Verification expired. Log in again.');
    }
    if (payload.purpose !== '2fa' || !payload.sub) {
      throw new UnauthorizedException('Invalid verification session');
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user?.totpEnabled || !user.totpSecret) {
      throw new UnauthorizedException('Two-factor authentication is not enabled');
    }
    if (!verifyTotpCode(user.totpSecret, code)) {
      throw new UnauthorizedException('Invalid authenticator code');
    }
    return this.buildAuthResponse(user);
  }

  async firebaseAuth(dto: FirebaseAuthRequestDto): Promise<AuthResponseDto> {
    if (!this.firebaseService.isConfigured()) {
      throw new ServiceUnavailableException(
        'Social login is not configured on the server',
      );
    }

    const firebaseUser = await this.firebaseService.verifyIdToken(dto.idToken);

    let user = await this.prisma.user.findUnique({
      where: { firebaseUid: firebaseUser.uid },
    });

    if (!user && firebaseUser.email) {
      user = await this.prisma.user.findUnique({
        where: { email: firebaseUser.email },
      });
    }

    if (!user) {
      if (!dto.role) {
        throw new BadRequestException(
          'Role is required when registering with social login',
        );
      }

      user = await this.prisma.user.create({
        data: {
          email: firebaseUser.email,
          firebaseUid: firebaseUser.uid,
          fullName: dto.fullName ?? firebaseUser.name,
          phoneNumber: dto.phoneNumber,
          country: dto.country,
          city: dto.city,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
          role: dto.role,
          profileImage: dto.profileImage ?? firebaseUser.picture,
          locale: dto.locale ?? 'en',
          authProvider: firebaseUser.provider,
          emailVerified: firebaseUser.emailVerified,
          phoneVerified: false,
          otpVerified: firebaseUser.emailVerified,
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          firebaseUid: firebaseUser.uid,
          fullName: user.fullName ?? dto.fullName ?? firebaseUser.name,
          profileImage:
            user.profileImage ?? dto.profileImage ?? firebaseUser.picture,
          emailVerified: firebaseUser.emailVerified || user.emailVerified,
          otpVerified: user.otpVerified || firebaseUser.emailVerified,
          authProvider: firebaseUser.provider,
        },
      });
    }

    return this.buildAuthResponse(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!stored.user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    if (stored.revokedAt) {
      await this.revokeTokenFamily(stored.userId, stored.familyId);
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    const nextToken = randomBytes(48).toString('hex');
    const nextHash = this.hashToken(nextToken);
    const refreshExpiresIn =
      this.configService.get<string>('jwt.refreshExpiresIn', '7d') ?? '7d';

    await this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date(), replacedByHash: nextHash },
      }),
      this.prisma.refreshToken.create({
        data: {
          tokenHash: nextHash,
          familyId: stored.familyId,
          userId: stored.userId,
          expiresAt: new Date(Date.now() + this.parseDuration(refreshExpiresIn)),
        },
      }),
    ]);

    return this.buildAuthResponse(stored.user, nextToken);
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string): Promise<{ message: string }> {
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { tokenVersion: { increment: 1 } },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    return { message: 'All sessions revoked' };
  }

  async requestOtp(
    destination: string,
    userId?: string,
  ): Promise<OtpRequestResponseDto> {
    return this.createAndSendOtp(
      destination,
      OtpPurpose.PHONE_VERIFICATION,
      userId,
      'verification',
    );
  }

  async requestLoginOtp(dto: OtpLoginRequestDto): Promise<OtpRequestResponseDto> {
    const destination = this.normalizeDestination(dto.destination);
    const user = await this.findUserByDestination(destination);
    if (!user) {
      throw new BadRequestException('No account found for this email or phone number');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }
    const target = this.resolveOtpTarget(user, destination);
    if (!target) {
      throw new BadRequestException('Account has no email or phone number on file');
    }
    return this.createAndSendOtp(target, OtpPurpose.LOGIN, user.id, 'login');
  }

  async verifyLoginOtp(dto: OtpLoginVerifyDto): Promise<AuthResponseDto> {
    const destination = this.normalizeDestination(dto.destination);
    const user = await this.findUserByDestination(destination);
    if (!user) {
      throw new BadRequestException('No account found for this email or phone number');
    }
    const target = this.resolveOtpTarget(user, destination);
    if (!target) {
      throw new BadRequestException('Account has no email or phone number on file');
    }
    await this.assertValidOtp(target, dto.code, OtpPurpose.LOGIN);
    let hydrated = await this.maybePromoteBootstrapAdmin(user);
    if (dto.locale && dto.locale !== hydrated.locale) {
      hydrated = await this.prisma.user.update({
        where: { id: hydrated.id },
        data: { locale: dto.locale },
      });
    }
    return this.buildAuthResponse(hydrated);
  }

  async forgotPassword(dto: ForgotPasswordRequestDto): Promise<MessageResponseDto> {
    const identifier = dto.identifier.trim();
    const user = await this.resolveUserByIdentifier(identifier);
    const genericMessage =
      'If an account exists, a verification code has been sent to your email or phone.';

    if (!user?.isActive) {
      return { message: genericMessage };
    }

    const target = this.resolveOtpTarget(user, identifier);
    if (target) {
      await this.createAndSendOtp(
        target,
        OtpPurpose.PASSWORD_RESET,
        user.id,
        'password reset',
      );
    }

    return { message: genericMessage };
  }

  async resetPassword(dto: ResetPasswordRequestDto): Promise<MessageResponseDto> {
    const identifier = dto.identifier.trim();
    const user = await this.resolveUserByIdentifier(identifier);
    if (!user) {
      throw new BadRequestException('Invalid reset request');
    }

    const target = user.email ?? user.phoneNumber;
    if (!target) {
      throw new BadRequestException('Invalid reset request');
    }

    await this.assertValidOtp(target, dto.code, OtpPurpose.PASSWORD_RESET);
    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { message: 'Password updated successfully' };
  }

  private async createAndSendOtp(
    destination: string,
    purpose: OtpPurpose,
    userId?: string,
    purposeLabel = 'verification',
    options?: { silentOnDeliveryFailure?: boolean },
  ): Promise<OtpRequestResponseDto> {
    const target = this.normalizeDestination(destination);
    if (!target) {
      throw new BadRequestException('Email or phone number is required');
    }

    const code = randomInt(100000, 999999).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresInSeconds = this.configService.get<number>(
      'otp.expiresInSeconds',
      300,
    );
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    await this.prisma.otpCode.updateMany({
      where: {
        phoneNumber: target,
        purpose,
        verified: false,
      },
      data: { verified: true },
    });

    await this.prisma.otpCode.create({
      data: {
        userId,
        phoneNumber: target,
        codeHash,
        purpose,
        expiresAt,
      },
    });

    try {
      await this.messagingService.sendOtp(target, code, purposeLabel);
    } catch (error) {
      this.logger.error(
        `OTP delivery failed for ${target} (${purposeLabel})`,
        error instanceof Error ? error.stack : error,
      );
      if (!options?.silentOnDeliveryFailure) {
        throw new ServiceUnavailableException('Unable to send verification code');
      }
    }

    const response: OtpRequestResponseDto = {
      message: 'OTP sent successfully',
      expiresInSeconds,
    };

    if (this.messagingService.isConsoleOnly()) {
      response.devCode = code;
    }

    return response;
  }

  private async assertValidOtp(
    destination: string,
    code: string,
    purpose: OtpPurpose,
  ): Promise<void> {
    const target = this.normalizeDestination(destination);
    const otp = await this.prisma.otpCode.findFirst({
      where: {
        phoneNumber: target,
        purpose,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      throw new BadRequestException('OTP expired or not found');
    }

    const maxAttempts = this.configService.get<number>('otp.maxAttempts', 5);
    if (otp.attempts >= maxAttempts) {
      throw new BadRequestException('Maximum OTP attempts exceeded');
    }

    const valid = await bcrypt.compare(code, otp.codeHash);
    if (!valid) {
      await this.prisma.otpCode.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Invalid OTP code');
    }

    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { verified: true },
    });
  }

  private normalizeDestination(value: string): string {
    return normalizeLoginIdentifier(value);
  }

  private resolveOtpTarget(
    user: { email: string | null; phoneNumber: string | null },
    identifierHint?: string,
  ): string | null {
    const hint = identifierHint?.trim() ?? '';
    if (hint.includes('@')) {
      return user.email;
    }
    const compact = hint.replace(/[\s\-()]/g, '');
    if (/^\+?\d/.test(compact)) {
      return user.phoneNumber;
    }
    return user.email ?? user.phoneNumber;
  }

  private phoneLookupVariants(value: string): string[] {
    const normalized = normalizeLoginIdentifier(value);
    const digits = normalized.replace(/\D/g, '');
    const variants = new Set<string>();
    if (normalized) {
      variants.add(normalized);
    }
    if (digits.startsWith('98') && digits.length >= 12) {
      variants.add(`+${digits}`);
      variants.add(`0${digits.slice(2)}`);
    }
    if (digits.startsWith('0') && digits.length >= 10) {
      variants.add(`+98${digits.slice(1)}`);
      variants.add(digits);
    }
    if (/^9\d{9}$/.test(digits)) {
      variants.add(`+98${digits}`);
      variants.add(`0${digits}`);
    }
    return [...variants];
  }

  private async resolveUserByIdentifier(identifier: string) {
    const normalized = normalizeLoginIdentifier(identifier);
    if (!normalized) {
      return null;
    }
    const phoneVariants = this.phoneLookupVariants(identifier);
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { email: normalized },
          { username: normalized },
          { phoneNumber: normalized },
          ...phoneVariants.map((phoneNumber) => ({ phoneNumber })),
        ],
      },
    });
  }

  private async findUserByDestination(destination: string) {
    const normalized = this.normalizeDestination(destination);
    const phoneVariants = this.phoneLookupVariants(destination);
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { email: normalized },
          { phoneNumber: normalized },
          ...phoneVariants.map((phoneNumber) => ({ phoneNumber })),
        ],
      },
    });
  }

  async verifyOtp(
    dto: VerifyOtpRequestDto,
    userId: string,
  ): Promise<AuthResponseDto> {
    const destination = dto.email?.trim().toLowerCase() || dto.phoneNumber?.trim();
    if (!destination) {
      throw new BadRequestException('Email or phone number is required');
    }

    await this.assertValidOtp(destination, dto.code, OtpPurpose.PHONE_VERIFICATION);

    const isEmail = destination.includes('@');
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: isEmail
        ? { email: destination, emailVerified: true, otpVerified: true }
        : { phoneNumber: destination, phoneVerified: true, otpVerified: true },
    });

    return this.buildAuthResponse(user);
  }

  private async buildAuthResponse(
    user: User,
    existingRefreshToken?: string,
  ): Promise<AuthResponseDto> {
    const issuer = this.configService.get<string>('jwt.issuer', 'bitemate')!;
    const audience = this.configService.get<string>('jwt.audience', 'bitemate-app')!;
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      otpVerified: user.otpVerified,
      tv: user.tokenVersion,
      jti: randomUUID(),
    };

    const accessExpiresIn =
      this.configService.get<string>('jwt.accessExpiresIn', '15m') ?? '15m';

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: accessExpiresIn as `${number}${'s' | 'm' | 'h' | 'd'}`,
      issuer,
      audience,
    });

    const refreshExpiresIn =
      this.configService.get<string>('jwt.refreshExpiresIn', '7d') ?? '7d';
    let refreshToken = existingRefreshToken;
    if (!refreshToken) {
      refreshToken = randomBytes(48).toString('hex');
      await this.prisma.refreshToken.create({
        data: {
          tokenHash: this.hashToken(refreshToken),
          familyId: randomUUID(),
          userId: user.id,
          expiresAt: new Date(Date.now() + this.parseDuration(refreshExpiresIn)),
        },
      });
    }

    return {
      user: mapUserToAuthDto(user),
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: this.parseDuration(accessExpiresIn) / 1000,
      },
    };
  }

  private async revokeTokenFamily(userId: string, familyId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.refreshToken.updateMany({
        where: { familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { tokenVersion: { increment: 1 } },
      }),
    ]);
  }

  private async resolveUsernameForRegister(
    requested: string | undefined,
    fullName: string,
  ): Promise<string> {
    if (requested?.trim()) {
      const normalized = normalizeUsername(requested);
      if (!isValidUsername(normalized)) {
        throw new BadRequestException('Username must be 3–30 letters, numbers, or underscores');
      }
      const taken = await this.prisma.user.findFirst({
        where: { username: { equals: normalized, mode: 'insensitive' } },
        select: { id: true },
      });
      if (taken) {
        throw new ConflictException('This username is already taken');
      }
      return normalized;
    }
    return this.allocateUsername(fullName);
  }

  private async allocateUsername(source: string): Promise<string> {
    const base =
      source
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
        .slice(0, 16) || 'user';
    for (let index = 0; index < 50; index += 1) {
      const candidate = index === 0 ? base : `${base}${index}`;
      const taken = await this.prisma.user.findUnique({ where: { username: candidate } });
      if (!taken) {
        return candidate;
      }
    }
    return `${base}${randomInt(1000, 9999)}`;
  }

  private loginKey(email: string, ipAddress?: string): string {
    return `${email.toLowerCase()}:${ipAddress ?? 'unknown'}`;
  }

  private async assertLoginNotLocked(email: string, ipAddress?: string): Promise<void> {
    const limit = this.configService.get<number>('security.loginFailLimit', 8)!;
    const count = await this.rateLimiter.getCount('login-fail', this.loginKey(email, ipAddress));
    if (count >= limit) {
      throw new HttpException('Too many login attempts. Try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  private async recordFailedLogin(email: string, ipAddress?: string): Promise<void> {
    const limit = this.configService.get<number>('security.loginFailLimit', 8)!;
    const windowSeconds = this.configService.get<number>('security.loginFailWindowSeconds', 900)!;
    const result = await this.rateLimiter.consume(
      'login-fail',
      this.loginKey(email, ipAddress),
      limit,
      windowSeconds,
    );
    if (!result.allowed) {
      throw new HttpException('Too many login attempts. Try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async maybePromoteBootstrapAdmin(user: User): Promise<User> {
    const bootstrapEmail = this.configService.get<string>('admin.bootstrapEmail');
    if (!bootstrapEmail || !user.email) {
      return user;
    }
    if (user.email.toLowerCase() !== bootstrapEmail.toLowerCase()) {
      return user;
    }
    if (user.role === 'PLATFORM_ADMIN' && user.otpVerified && user.adminVerified) {
      return user;
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        role: 'PLATFORM_ADMIN',
        emailVerified: true,
        otpVerified: true,
        adminVerified: true,
      },
    });
  }

  private parseDuration(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value);
    if (!match) {
      return 15 * 60 * 1000;
    }

    const amount = Number(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return amount * 1000;
      case 'm':
        return amount * 60 * 1000;
      case 'h':
        return amount * 60 * 60 * 1000;
      case 'd':
        return amount * 24 * 60 * 60 * 1000;
      default:
        return 15 * 60 * 1000;
    }
  }
}
