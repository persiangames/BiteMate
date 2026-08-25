import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  AVAILABILITY_STATUSES,
  EDUCATION_LEVELS,
  GENDERS,
  MEAL_SLOTS,
  PASSWORD_PATTERN,
  SUPPORTED_LOCALES,
  USERNAME_PATTERN,
  USER_ROLES,
  normalizePhoneInput,
  type AvailabilityStatus,
  type EducationLevel,
  type Gender,
  type MealSlot,
  type SupportedLocale,
  type UserRole,
} from '@bitemate/shared';

export class RegisterDto {
  @IsIn(['email', 'phone'])
  channel!: 'email' | 'phone';

  @ValidateIf((dto: RegisterDto) => dto.channel === 'email')
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(PASSWORD_PATTERN, {
    message:
      'Password must be 8–128 characters and include a letter, a number, and a symbol',
  })
  password!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ValidateIf((dto: RegisterDto) => dto.channel === 'phone')
  @Transform(({ value }) => (typeof value === 'string' ? normalizePhoneInput(value) : value))
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/, {
    message: 'Phone number must be in international format, e.g. +989121234567',
  })
  phoneNumber?: string;

  @IsString()
  @IsNotEmpty()
  country!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsDateString()
  dateOfBirth!: string;

  @IsEnum(USER_ROLES)
  role!: UserRole;

  @IsEnum(SUPPORTED_LOCALES)
  locale!: SupportedLocale;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @Matches(USERNAME_PATTERN, {
    message: 'Username must be 3–30 letters, numbers, or underscores',
  })
  username?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;
}

export class LoginDto {
  @Transform(({ obj }) => obj.identifier ?? obj.email)
  @IsString()
  @IsNotEmpty()
  identifier!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsEnum(SUPPORTED_LOCALES)
  locale?: SupportedLocale;
}

export class FirebaseAuthDto {
  @IsString()
  @IsNotEmpty()
  idToken!: string;

  @IsOptional()
  @IsEnum(USER_ROLES)
  role?: UserRole;

  @IsOptional()
  @IsEnum(SUPPORTED_LOCALES)
  locale?: SupportedLocale;

  @IsOptional()
  @Matches(/^\+[1-9]\d{7,14}$/)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class RequestOtpDto {
  @IsOptional()
  @Matches(/^\+[1-9]\d{7,14}$/)
  phoneNumber?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class VerifyOtpDto {
  @IsOptional()
  @Matches(/^\+[1-9]\d{7,14}$/)
  phoneNumber?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fullName?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @Matches(/^[a-zA-Z0-9_]{3,30}$/)
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(USER_ROLES)
  role?: UserRole;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsEnum(SUPPORTED_LOCALES)
  locale?: SupportedLocale;

  @IsOptional()
  @IsBoolean()
  liveLocationEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  invisibleMode?: boolean;

  @IsOptional()
  @IsEnum(AVAILABILITY_STATUSES)
  availabilityStatus?: AvailabilityStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  liveLatitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  liveLongitude?: number;

  @IsOptional()
  @IsEnum(GENDERS)
  gender?: Gender;

  @IsOptional()
  @IsEnum(EDUCATION_LEVELS)
  education?: EducationLevel;

  @IsOptional()
  @IsArray()
  @IsEnum(MEAL_SLOTS, { each: true })
  preferredMeals?: MealSlot[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  favoriteCuisines?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  favoriteFoods?: string[];

  @IsOptional()
  @IsBoolean()
  lookingToEat?: boolean;
}

export class UpdateLocaleDto {
  @IsEnum(SUPPORTED_LOCALES)
  locale!: SupportedLocale;
}

export class UsernameQueryDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @Matches(/^[a-zA-Z0-9_]{3,30}$/)
  username!: string;
}

export class SearchUsersQueryDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/^@/, '') : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  q!: string;
}

export class RequestContactChangeDto {
  @IsIn(['email', 'phone'])
  channel!: 'email' | 'phone';

  @IsString()
  @IsNotEmpty()
  value!: string;
}

export class VerifyContactChangeDto {
  @IsIn(['email', 'phone'])
  channel!: 'email' | 'phone';

  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;
}

export class VerifyTwoFactorDto {
  @IsString()
  @IsNotEmpty()
  challengeToken!: string;

  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;
}

export class ForgotPasswordDto {
  @IsString()
  @IsNotEmpty()
  identifier!: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  identifier!: string;

  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(PASSWORD_PATTERN, {
    message:
      'Password must be 8–128 characters and include a letter, a number, and a symbol',
  })
  newPassword!: string;
}

export class OtpLoginRequestDto {
  @IsString()
  @IsNotEmpty()
  destination!: string;
}

export class OtpLoginVerifyDto {
  @IsString()
  @IsNotEmpty()
  destination!: string;

  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;

  @IsOptional()
  @IsEnum(SUPPORTED_LOCALES)
  locale?: SupportedLocale;
}

export class EnableTwoFactorDto {
  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;
}

export class DisableTwoFactorDto {
  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(PASSWORD_PATTERN, {
    message:
      'Password must be 8–128 characters and include a letter, a number, and a symbol',
  })
  newPassword!: string;
}

export class UpdateThemeDto {
  @IsIn(['light', 'dark'])
  theme!: 'light' | 'dark';
}

export class DeleteAccountRequestDto {
  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @Matches(/^DELETE$/i)
  confirmation!: string;

  @IsIn(['email', 'phone'])
  channel!: 'email' | 'phone';
}

export class DeleteAccountConfirmDto {
  @IsIn(['email', 'phone'])
  channel!: 'email' | 'phone';

  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;
}
