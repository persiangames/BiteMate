import { type AvailabilityStatus, type EducationLevel, type Gender, type MealSlot, type SupportedLocale, type UserRole } from '@bitemate/shared';
export declare class RegisterDto {
    channel: 'email' | 'phone';
    email?: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
    country: string;
    city: string;
    dateOfBirth: string;
    role: UserRole;
    locale: SupportedLocale;
    username?: string;
    profileImage?: string;
}
export declare class LoginDto {
    identifier: string;
    password: string;
    locale?: SupportedLocale;
}
export declare class FirebaseAuthDto {
    idToken: string;
    role?: UserRole;
    locale?: SupportedLocale;
    phoneNumber?: string;
    country?: string;
    city?: string;
    dateOfBirth?: string;
    fullName?: string;
    profileImage?: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class RequestOtpDto {
    phoneNumber?: string;
    email?: string;
}
export declare class VerifyOtpDto {
    phoneNumber?: string;
    email?: string;
    code: string;
}
export declare class UpdateProfileDto {
    fullName?: string;
    username?: string;
    bio?: string;
    country?: string;
    city?: string;
    dateOfBirth?: string;
    role?: UserRole;
    profileImage?: string;
    coverImage?: string;
    locale?: SupportedLocale;
    liveLocationEnabled?: boolean;
    invisibleMode?: boolean;
    availabilityStatus?: AvailabilityStatus;
    liveLatitude?: number;
    liveLongitude?: number;
    gender?: Gender;
    education?: EducationLevel;
    preferredMeals?: MealSlot[];
    favoriteCuisines?: string[];
    favoriteFoods?: string[];
    lookingToEat?: boolean;
}
export declare class UpdateLocaleDto {
    locale: SupportedLocale;
}
export declare class UsernameQueryDto {
    username: string;
}
export declare class SearchUsersQueryDto {
    q: string;
}
export declare class RequestContactChangeDto {
    channel: 'email' | 'phone';
    value: string;
}
export declare class VerifyContactChangeDto {
    channel: 'email' | 'phone';
    value: string;
    code: string;
}
export declare class VerifyTwoFactorDto {
    challengeToken: string;
    code: string;
}
export declare class EnableTwoFactorDto {
    code: string;
}
export declare class DisableTwoFactorDto {
    password: string;
    code: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class UpdateThemeDto {
    theme: 'light' | 'dark';
}
export declare class DeleteAccountRequestDto {
    password: string;
    confirmation: string;
    channel: 'email' | 'phone';
}
export declare class DeleteAccountConfirmDto {
    channel: 'email' | 'phone';
    code: string;
}
