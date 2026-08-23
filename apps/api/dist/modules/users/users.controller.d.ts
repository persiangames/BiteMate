import type { AuthUserDto, OtpRequestResponseDto, ProfileMeetupHistoryDto, PublicUserDto, UsernameAvailableResponseDto, UserSearchHitDto } from '@bitemate/shared';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { ChangePasswordDto, DeleteAccountConfirmDto, DeleteAccountRequestDto, DisableTwoFactorDto, EnableTwoFactorDto, RequestContactChangeDto, SearchUsersQueryDto, UpdateLocaleDto, UpdateProfileDto, UpdateThemeDto, UsernameQueryDto, VerifyContactChangeDto } from '../auth/dto/auth.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: JwtPayload): Promise<AuthUserDto>;
    checkUsername(user: JwtPayload, query: UsernameQueryDto): Promise<UsernameAvailableResponseDto>;
    searchUsers(query: SearchUsersQueryDto): Promise<UserSearchHitDto[]>;
    getPublicProfile(user: JwtPayload, username: string): Promise<PublicUserDto>;
    getPublicProfileById(user: JwtPayload, userId: string): Promise<PublicUserDto>;
    listMeetupHistory(userId: string, kind?: string): Promise<ProfileMeetupHistoryDto>;
    updateProfilePatch(user: JwtPayload, dto: UpdateProfileDto): Promise<AuthUserDto>;
    updateProfilePut(user: JwtPayload, dto: UpdateProfileDto): Promise<AuthUserDto>;
    requestContactChange(user: JwtPayload, dto: RequestContactChangeDto): Promise<OtpRequestResponseDto>;
    verifyContactChange(user: JwtPayload, dto: VerifyContactChangeDto): Promise<AuthUserDto>;
    updateLocale(user: JwtPayload, dto: UpdateLocaleDto): Promise<AuthUserDto>;
    updateTheme(user: JwtPayload, dto: UpdateThemeDto): Promise<AuthUserDto>;
    changePassword(user: JwtPayload, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    setupTwoFactor(user: JwtPayload): Promise<{
        otpauthUrl: string;
        qrDataUrl: string;
        secret: string;
    }>;
    enableTwoFactor(user: JwtPayload, dto: EnableTwoFactorDto): Promise<AuthUserDto>;
    disableTwoFactor(user: JwtPayload, dto: DisableTwoFactorDto): Promise<AuthUserDto>;
    requestDelete(user: JwtPayload, dto: DeleteAccountRequestDto): Promise<OtpRequestResponseDto>;
    confirmDelete(user: JwtPayload, dto: DeleteAccountConfirmDto): Promise<{
        message: string;
    }>;
    fullAccessCheck(user: JwtPayload): {
        ok: true;
        userId: string;
    };
}
