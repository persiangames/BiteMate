import type { EducationLevel, Gender, MealSlot } from '../types/dining.types';
import type { AvailabilityStatus } from '../types/location.types';
import type { AuthProvider, SupportedLocale, UserRole } from '../types/platform.types';
import type { RelationshipStatus } from '../types/profile.types';

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUserDto {
  id: string;
  email: string | null;
  phoneNumber: string | null;
  fullName: string | null;
  username: string | null;
  bio: string | null;
  country: string | null;
  city: string | null;
  dateOfBirth: string | null;
  role: UserRole | null;
  profileImage: string | null;
  coverImage: string | null;
  locale: SupportedLocale;
  authProvider: AuthProvider;
  emailVerified: boolean;
  phoneVerified: boolean;
  otpVerified: boolean;
  liveLocationEnabled: boolean;
  invisibleMode: boolean;
  availabilityStatus: AvailabilityStatus;
  liveLatitude: number | null;
  liveLongitude: number | null;
  lastLiveLocationAt: string | null;
  totpEnabled: boolean;
  themePreference: string | null;
  followerCount: number;
  followingCount: number;
  gender: Gender | null;
  education: EducationLevel | null;
  preferredMeals: MealSlot[];
  favoriteCuisines: string[];
  favoriteFoods: string[];
  lookingToEat: boolean;
  interests: string[];
  relationshipStatus: RelationshipStatus | null;
  hasChildren: boolean | null;
  profileCompletionPercent: number;
}

export interface AuthResponseDto {
  user: AuthUserDto;
  tokens: AuthTokensDto;
  twoFactorRequired?: boolean;
  challengeToken?: string;
}

export interface RegisterRequestDto {
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

export interface LoginRequestDto {
  email?: string;
  identifier?: string;
  password: string;
  locale?: SupportedLocale;
}

export interface FirebaseAuthRequestDto {
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

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface RequestOtpRequestDto {
  phoneNumber?: string;
  email?: string;
}

export interface VerifyOtpRequestDto {
  phoneNumber?: string;
  email?: string;
  code: string;
}

export interface UpdateProfileRequestDto {
  fullName?: string;
  username?: string;
  bio?: string;
  phoneNumber?: string;
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
  gender?: Gender | null;
  education?: EducationLevel | null;
  preferredMeals?: MealSlot[];
  favoriteCuisines?: string[];
  favoriteFoods?: string[];
  lookingToEat?: boolean;
  interests?: string[];
  relationshipStatus?: RelationshipStatus | null;
  hasChildren?: boolean | null;
}

export type ContactChangeChannel = 'email' | 'phone';

export interface UsernameAvailableResponseDto {
  username: string;
  available: boolean;
}

export interface RequestContactChangeDto {
  channel: ContactChangeChannel;
  value: string;
}

export interface VerifyContactChangeDto {
  channel: ContactChangeChannel;
  value: string;
  code: string;
}

export interface UpdateLocaleRequestDto {
  locale: SupportedLocale;
}

export interface OtpRequestResponseDto {
  message: string;
  expiresInSeconds: number;
  devCode?: string;
}

export interface ForgotPasswordRequestDto {
  identifier: string;
}

export interface ResetPasswordRequestDto {
  identifier: string;
  code: string;
  newPassword: string;
}

export interface OtpLoginRequestDto {
  destination: string;
}

export interface OtpLoginVerifyDto {
  destination: string;
  code: string;
  locale?: SupportedLocale;
}

export interface MessageResponseDto {
  message: string;
}

export interface LocalizationBundleDto {
  locale: SupportedLocale;
  keys: Record<string, string>;
}

export interface SupportedLocalesResponseDto {
  locales: Array<{ code: SupportedLocale; label: string }>;
}
