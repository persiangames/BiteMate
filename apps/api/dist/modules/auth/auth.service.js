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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const node_crypto_1 = require("node:crypto");
const prisma_service_1 = require("../database/prisma.service");
const rate_limiter_service_1 = require("../redis/rate-limiter.service");
const fraud_detection_service_1 = require("../security/fraud-detection.service");
const firebase_service_1 = require("./firebase.service");
const user_mapper_1 = require("./mappers/user.mapper");
const totp_1 = require("./totp");
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    firebaseService;
    rateLimiter;
    fraudDetection;
    constructor(prisma, jwtService, configService, firebaseService, rateLimiter, fraudDetection) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.firebaseService = firebaseService;
        this.rateLimiter = rateLimiter;
        this.fraudDetection = fraudDetection;
    }
    async register(dto, context = {}) {
        const email = dto.channel === 'email' ? dto.email?.trim().toLowerCase() : undefined;
        const phoneNumber = dto.channel === 'phone' ? dto.phoneNumber?.trim() : undefined;
        if (dto.channel === 'email' && !email) {
            throw new common_1.BadRequestException('Email is required');
        }
        if (dto.channel === 'phone' && !phoneNumber) {
            throw new common_1.BadRequestException('Phone number is required');
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
            throw new common_1.ConflictException('Email or phone number already registered');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const username = await this.allocateUsername(dto.username || dto.fullName);
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
                authProvider: client_1.AuthProvider.EMAIL,
                emailVerified: false,
                phoneVerified: false,
                otpVerified: false,
            },
        });
        await this.fraudDetection.inspectNewAccount(user.id, context);
        return this.buildAuthResponse(user);
    }
    async login(dto, context = {}) {
        const identifier = (dto.identifier ?? dto.email ?? '').trim();
        await this.assertLoginNotLocked(identifier, context.ipAddress);
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [{ email: identifier }, { username: identifier }, { phoneNumber: identifier }],
            },
        });
        if (!user?.passwordHash) {
            await this.recordFailedLogin(identifier, context.ipAddress);
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid) {
            await this.recordFailedLogin(identifier, context.ipAddress);
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is disabled');
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
            const issuer = this.configService.get('jwt.issuer', 'bitemate');
            const audience = this.configService.get('jwt.audience', 'bitemate-app');
            const challengeToken = await this.jwtService.signAsync({ sub: hydrated.id, purpose: '2fa', jti: (0, node_crypto_1.randomUUID)() }, { expiresIn: '5m', issuer, audience });
            return {
                user: (0, user_mapper_1.mapUserToAuthDto)(hydrated),
                tokens: { accessToken: '', refreshToken: '', expiresIn: 0 },
                twoFactorRequired: true,
                challengeToken,
            };
        }
        return this.buildAuthResponse(hydrated);
    }
    async verifyTwoFactorLogin(challengeToken, code) {
        const issuer = this.configService.get('jwt.issuer', 'bitemate');
        const audience = this.configService.get('jwt.audience', 'bitemate-app');
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(challengeToken, { issuer, audience });
        }
        catch {
            throw new common_1.UnauthorizedException('Verification expired. Log in again.');
        }
        if (payload.purpose !== '2fa' || !payload.sub) {
            throw new common_1.UnauthorizedException('Invalid verification session');
        }
        const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
        if (!user?.totpEnabled || !user.totpSecret) {
            throw new common_1.UnauthorizedException('Two-factor authentication is not enabled');
        }
        if (!(0, totp_1.verifyTotpCode)(user.totpSecret, code)) {
            throw new common_1.UnauthorizedException('Invalid authenticator code');
        }
        return this.buildAuthResponse(user);
    }
    async firebaseAuth(dto) {
        if (!this.firebaseService.isConfigured()) {
            throw new common_1.ServiceUnavailableException('Social login is not configured on the server');
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
                throw new common_1.BadRequestException('Role is required when registering with social login');
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
                    otpVerified: false,
                },
            });
        }
        else {
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    firebaseUid: firebaseUser.uid,
                    fullName: user.fullName ?? dto.fullName ?? firebaseUser.name,
                    profileImage: user.profileImage ?? dto.profileImage ?? firebaseUser.picture,
                    emailVerified: firebaseUser.emailVerified || user.emailVerified,
                    authProvider: firebaseUser.provider,
                },
            });
        }
        return this.buildAuthResponse(user);
    }
    async refresh(refreshToken) {
        const tokenHash = this.hashToken(refreshToken);
        const stored = await this.prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });
        if (!stored || stored.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        if (!stored.user.isActive) {
            throw new common_1.UnauthorizedException('Account is disabled');
        }
        if (stored.revokedAt) {
            await this.revokeTokenFamily(stored.userId, stored.familyId);
            throw new common_1.UnauthorizedException('Refresh token reuse detected');
        }
        const nextToken = (0, node_crypto_1.randomBytes)(48).toString('hex');
        const nextHash = this.hashToken(nextToken);
        const refreshExpiresIn = this.configService.get('jwt.refreshExpiresIn', '7d') ?? '7d';
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
    async logout(refreshToken) {
        const tokenHash = this.hashToken(refreshToken);
        await this.prisma.refreshToken.updateMany({
            where: { tokenHash },
            data: { revokedAt: new Date() },
        });
        return { message: 'Logged out successfully' };
    }
    async logoutAll(userId) {
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
    async requestOtp(destination, userId) {
        const target = destination.trim();
        if (!target) {
            throw new common_1.BadRequestException('Email or phone number is required');
        }
        const code = (0, node_crypto_1.randomInt)(100000, 999999).toString();
        const codeHash = await bcrypt.hash(code, 10);
        const expiresInSeconds = this.configService.get('otp.expiresInSeconds', 300);
        const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
        await this.prisma.otpCode.updateMany({
            where: {
                phoneNumber: target,
                purpose: client_1.OtpPurpose.PHONE_VERIFICATION,
                verified: false,
            },
            data: { verified: true },
        });
        await this.prisma.otpCode.create({
            data: {
                userId,
                phoneNumber: target,
                codeHash,
                purpose: client_1.OtpPurpose.PHONE_VERIFICATION,
                expiresAt,
            },
        });
        const nodeEnv = this.configService.get('app.nodeEnv', 'development');
        const response = {
            message: 'OTP sent successfully',
            expiresInSeconds,
        };
        if (nodeEnv === 'development') {
            response.devCode = code;
        }
        return response;
    }
    async verifyOtp(dto, userId) {
        const destination = dto.email?.trim().toLowerCase() || dto.phoneNumber?.trim();
        if (!destination) {
            throw new common_1.BadRequestException('Email or phone number is required');
        }
        const otp = await this.prisma.otpCode.findFirst({
            where: {
                phoneNumber: destination,
                purpose: client_1.OtpPurpose.PHONE_VERIFICATION,
                verified: false,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!otp) {
            throw new common_1.BadRequestException('OTP expired or not found');
        }
        const maxAttempts = this.configService.get('otp.maxAttempts', 5);
        if (otp.attempts >= maxAttempts) {
            throw new common_1.BadRequestException('Maximum OTP attempts exceeded');
        }
        const valid = await bcrypt.compare(dto.code, otp.codeHash);
        if (!valid) {
            await this.prisma.otpCode.update({
                where: { id: otp.id },
                data: { attempts: { increment: 1 } },
            });
            throw new common_1.BadRequestException('Invalid OTP code');
        }
        await this.prisma.otpCode.update({
            where: { id: otp.id },
            data: { verified: true },
        });
        const isEmail = destination.includes('@');
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: isEmail
                ? { email: destination, emailVerified: true, otpVerified: true }
                : { phoneNumber: destination, phoneVerified: true, otpVerified: true },
        });
        return this.buildAuthResponse(user);
    }
    async buildAuthResponse(user, existingRefreshToken) {
        const issuer = this.configService.get('jwt.issuer', 'bitemate');
        const audience = this.configService.get('jwt.audience', 'bitemate-app');
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            otpVerified: user.otpVerified,
            tv: user.tokenVersion,
            jti: (0, node_crypto_1.randomUUID)(),
        };
        const accessExpiresIn = this.configService.get('jwt.accessExpiresIn', '15m') ?? '15m';
        const accessToken = await this.jwtService.signAsync(payload, {
            expiresIn: accessExpiresIn,
            issuer,
            audience,
        });
        const refreshExpiresIn = this.configService.get('jwt.refreshExpiresIn', '7d') ?? '7d';
        let refreshToken = existingRefreshToken;
        if (!refreshToken) {
            refreshToken = (0, node_crypto_1.randomBytes)(48).toString('hex');
            await this.prisma.refreshToken.create({
                data: {
                    tokenHash: this.hashToken(refreshToken),
                    familyId: (0, node_crypto_1.randomUUID)(),
                    userId: user.id,
                    expiresAt: new Date(Date.now() + this.parseDuration(refreshExpiresIn)),
                },
            });
        }
        return {
            user: (0, user_mapper_1.mapUserToAuthDto)(user),
            tokens: {
                accessToken,
                refreshToken,
                expiresIn: this.parseDuration(accessExpiresIn) / 1000,
            },
        };
    }
    async revokeTokenFamily(userId, familyId) {
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
    async allocateUsername(source) {
        const base = source
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
        return `${base}${(0, node_crypto_1.randomInt)(1000, 9999)}`;
    }
    loginKey(email, ipAddress) {
        return `${email.toLowerCase()}:${ipAddress ?? 'unknown'}`;
    }
    async assertLoginNotLocked(email, ipAddress) {
        const limit = this.configService.get('security.loginFailLimit', 8);
        const count = await this.rateLimiter.getCount('login-fail', this.loginKey(email, ipAddress));
        if (count >= limit) {
            throw new common_1.HttpException('Too many login attempts. Try again later.', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
    }
    async recordFailedLogin(email, ipAddress) {
        const limit = this.configService.get('security.loginFailLimit', 8);
        const windowSeconds = this.configService.get('security.loginFailWindowSeconds', 900);
        const result = await this.rateLimiter.consume('login-fail', this.loginKey(email, ipAddress), limit, windowSeconds);
        if (!result.allowed) {
            throw new common_1.HttpException('Too many login attempts. Try again later.', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
    }
    hashToken(token) {
        return (0, node_crypto_1.createHash)('sha256').update(token).digest('hex');
    }
    async maybePromoteBootstrapAdmin(user) {
        const bootstrapEmail = this.configService.get('admin.bootstrapEmail');
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
    parseDuration(value) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        firebase_service_1.FirebaseService,
        rate_limiter_service_1.RateLimiterService,
        fraud_detection_service_1.FraudDetectionService])
], AuthService);
//# sourceMappingURL=auth.service.js.map