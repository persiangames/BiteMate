import { ConfigService } from '@nestjs/config';
import type { AuthUserDto, OtpRequestResponseDto, ProfileMeetupHistoryDto, PublicUserDto, UsernameAvailableResponseDto, UserSearchHitDto } from '@bitemate/shared';
import { PrismaService } from '../database/prisma.service';
import type { ChangePasswordDto, DeleteAccountConfirmDto, DeleteAccountRequestDto, DisableTwoFactorDto, EnableTwoFactorDto, RequestContactChangeDto, UpdateLocaleDto, UpdateProfileDto, UpdateThemeDto, VerifyContactChangeDto } from '../auth/dto/auth.dto';
import { LocationService } from '../location/location.service';
import { RateLimiterService } from '../redis/rate-limiter.service';
export declare class UsersService {
    private readonly prisma;
    private readonly locationService;
    private readonly configService;
    private readonly rateLimiter;
    private readonly logger;
    constructor(prisma: PrismaService, locationService: LocationService, configService: ConfigService, rateLimiter: RateLimiterService);
    getProfile(userId: string): Promise<AuthUserDto>;
    searchUsers(query: string, limit?: number): Promise<UserSearchHitDto[]>;
    getPublicProfile(username: string, viewerId?: string): Promise<PublicUserDto>;
    getPublicProfileById(userId: string, viewerId?: string): Promise<PublicUserDto>;
    listMeetupHistory(userId: string, kind: 'hosted' | 'attended'): Promise<ProfileMeetupHistoryDto>;
    private toPublicUser;
    private toHistoryEvent;
    isUsernameAvailable(username: string, exceptUserId?: string): Promise<UsernameAvailableResponseDto>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<AuthUserDto>;
    requestContactChange(userId: string, dto: RequestContactChangeDto): Promise<OtpRequestResponseDto>;
    verifyContactChange(userId: string, dto: VerifyContactChangeDto): Promise<AuthUserDto>;
    updateLocale(userId: string, dto: UpdateLocaleDto): Promise<AuthUserDto>;
    private normalizeDestination;
    private assertDestinationFree;
    private throwUniqueConflict;
    setupTwoFactor(userId: string): Promise<{
        otpauthUrl: string;
        qrDataUrl: string;
        secret: string;
    }>;
    enableTwoFactor(userId: string, dto: EnableTwoFactorDto): Promise<AuthUserDto>;
    disableTwoFactor(userId: string, dto: DisableTwoFactorDto): Promise<AuthUserDto>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    updateTheme(userId: string, dto: UpdateThemeDto): Promise<AuthUserDto>;
    requestAccountDeletion(userId: string, dto: DeleteAccountRequestDto): Promise<OtpRequestResponseDto>;
    confirmAccountDeletion(userId: string, dto: DeleteAccountConfirmDto): Promise<{
        message: string;
    }>;
}
