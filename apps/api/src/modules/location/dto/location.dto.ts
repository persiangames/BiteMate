import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  AVAILABILITY_STATUSES,
  EDUCATION_LEVELS,
  GENDERS,
  MEAL_SLOTS,
  PROFILE_INTERESTS,
  USER_ROLES,
  type AvailabilityStatus,
  type EducationLevel,
  type Gender,
  type MealSlot,
  type ProfileInterest,
  type UserRole,
} from '@bitemate/shared';

function emptyToUndefined(value: unknown) {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  return value;
}

export class UpdateLiveLocationDto {
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;
}

export class NearbyUsersQueryDto {
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  radius: number = 10;

  @IsOptional()
  @IsEnum(USER_ROLES)
  role?: UserRole;

  @IsOptional()
  @IsEnum(AVAILABILITY_STATUSES)
  availability?: AvailabilityStatus;

  @IsOptional()
  @Transform(({ value }) => emptyToUndefined(value))
  @Type(() => Number)
  @IsNumber()
  @Min(18)
  @Max(99)
  ageMin?: number;

  @IsOptional()
  @Transform(({ value }) => emptyToUndefined(value))
  @Type(() => Number)
  @IsNumber()
  @Min(18)
  @Max(99)
  ageMax?: number;

  @IsOptional()
  @Transform(({ value }) => emptyToUndefined(value))
  @IsEnum(GENDERS)
  gender?: Gender;

  @IsOptional()
  @Transform(({ value }) => emptyToUndefined(value))
  @IsEnum(EDUCATION_LEVELS)
  education?: EducationLevel;

  @IsOptional()
  @Transform(({ value }) => emptyToUndefined(value))
  @IsEnum(MEAL_SLOTS)
  mealSlot?: MealSlot;

  @IsOptional()
  @Transform(({ value }) => emptyToUndefined(value))
  @IsString()
  @MaxLength(80)
  country?: string;

  @IsOptional()
  @Transform(({ value }) => emptyToUndefined(value))
  @IsString()
  @MaxLength(80)
  city?: string;

  @IsOptional()
  @Transform(({ value }) => emptyToUndefined(value))
  @IsString()
  @MaxLength(80)
  foodType?: string;

  @IsOptional()
  @Transform(({ value }) => emptyToUndefined(value))
  @IsString()
  @MaxLength(80)
  foodName?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return undefined;
  })
  @IsBoolean()
  lookingToEat?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return undefined;
  })
  @IsArray()
  @IsEnum(PROFILE_INTERESTS, { each: true })
  interests?: ProfileInterest[];

  get radiusKm(): number {
    return this.radius;
  }
}
