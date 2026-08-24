import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { AuthResponseDto, FirebaseAuthRequestDto, ForgotPasswordRequestDto, LoginRequestDto, MessageResponseDto, OtpLoginRequestDto, OtpLoginVerifyDto, OtpRequestResponseDto, RegisterRequestDto, ResetPasswordRequestDto, VerifyOtpRequestDto } from '@bitemate/shared';
import { PrismaService } from '../database/prisma.service';
import { RateLimiterService } from '../redis/rate-limiter.service';
import { FraudDetectionService } from '../security/fraud-detection.service';
import { FirebaseService } from './firebase.service';
import { MessagingService } from '../messaging/messaging.service';
export interface AuthRequestContext {
    ipAddress?: string;
    userAgent?: string;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly firebaseService;
    private readonly messagingService;
    private readonly rateLimiter;
    private readonly fraudDetection;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, firebaseService: FirebaseService, messagingService: MessagingService, rateLimiter: RateLimiterService, fraudDetection: FraudDetectionService);
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
    requestLoginOtp(dto: OtpLoginRequestDto): Promise<OtpRequestResponseDto>;
    verifyLoginOtp(dto: OtpLoginVerifyDto): Promise<AuthResponseDto>;
    forgotPassword(dto: ForgotPasswordRequestDto): Promise<MessageResponseDto>;
    resetPassword(dto: ResetPasswordRequestDto): Promise<MessageResponseDto>;
    private createAndSendOtp;
    private assertValidOtp;
    private normalizeDestination;
    private resolveUserByIdentifier;
    private findUserByDestination;
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
