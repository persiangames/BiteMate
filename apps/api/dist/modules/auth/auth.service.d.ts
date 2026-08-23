import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { AuthResponseDto, FirebaseAuthRequestDto, LoginRequestDto, OtpRequestResponseDto, RegisterRequestDto, VerifyOtpRequestDto } from '@bitemate/shared';
import { PrismaService } from '../database/prisma.service';
import { RateLimiterService } from '../redis/rate-limiter.service';
import { FraudDetectionService } from '../security/fraud-detection.service';
import { FirebaseService } from './firebase.service';
export interface AuthRequestContext {
    ipAddress?: string;
    userAgent?: string;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly firebaseService;
    private readonly rateLimiter;
    private readonly fraudDetection;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, firebaseService: FirebaseService, rateLimiter: RateLimiterService, fraudDetection: FraudDetectionService);
    register(dto: RegisterRequestDto, context?: AuthRequestContext): Promise<AuthResponseDto>;
    login(dto: LoginRequestDto, context?: AuthRequestContext): Promise<AuthResponseDto>;
    verifyTwoFactorLogin(challengeToken: string, code: string): Promise<AuthResponseDto>;
    firebaseAuth(dto: FirebaseAuthRequestDto): Promise<AuthResponseDto>;
    refresh(refreshToken: string): Promise<AuthResponseDto>;
    logout(refreshToken: string): Promise<{
        message: string;
    }>;
    logoutAll(userId: string): Promise<{
        message: string;
    }>;
    requestOtp(destination: string, userId?: string): Promise<OtpRequestResponseDto>;
    verifyOtp(dto: VerifyOtpRequestDto, userId: string): Promise<AuthResponseDto>;
    private buildAuthResponse;
    private revokeTokenFamily;
    private allocateUsername;
    private loginKey;
    private assertLoginNotLocked;
    private recordFailedLogin;
    private hashToken;
    private maybePromoteBootstrapAdmin;
    private parseDuration;
}
