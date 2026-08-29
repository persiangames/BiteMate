import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  EDUCATION_LEVELS,
  GENDERS,
  MEAL_SLOTS,
  PROFILE_INTERESTS,
  type EducationLevel,
  type Gender,
  type MealSlot,
  type ProfileInterest,
} from '@bitemate/shared';

function emptyToUndefined(value: unknown) {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  return value;
}

export class CreateMeetupDto {
  @IsString()
  @MaxLength(120)
  foodType!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  foodCategory?: string;

  @IsString()
  scheduledAt!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.5)
  @Max(50)
  radiusKm!: number;

  @Type(() => Number)
  @IsInt()
  @Min(2)
  @Max(20)
  desiredPeople!: number;

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

  @IsOptional()
  @IsString()
  @MaxLength(120)
  locationLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsEnum(MEAL_SLOTS)
  mealSlot?: MealSlot;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  foodName?: string;

  @IsOptional()
  @IsEnum(GENDERS)
  preferredGender?: Gender;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(18)
  @Max(99)
  ageMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(18)
  @Max(99)
  ageMax?: number;

  @IsOptional()
  @IsEnum(EDUCATION_LEVELS)
  preferredEducation?: EducationLevel;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;
}

export class NearbyMeetupsQueryDto {
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
  radiusKm: number = 10;

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
  @Transform(({ value }) => emptyToUndefined(value))
  @IsEnum(GENDERS)
  gender?: Gender;

  @IsOptional()
  @Transform(({ value }) => emptyToUndefined(value))
  @IsEnum(EDUCATION_LEVELS)
  education?: EducationLevel;

  @IsOptional()
  @Transform(({ value }) => emptyToUndefined(value))
  @Type(() => Number)
  @IsInt()
  @Min(18)
  @Max(99)
  ageMin?: number;

  @IsOptional()
  @Transform(({ value }) => emptyToUndefined(value))
  @Type(() => Number)
  @IsInt()
  @Min(18)
  @Max(99)
  ageMax?: number;

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
}
export class MeetupMatchQueryDto {
  @IsString()
  meetupId!: string;
}

export class SendMeetupInviteDto {
  @IsString()
  meetupId!: string;

  @IsString()
  inviteeId!: string;
}

export class RespondMeetupInviteDto {
  @IsString()
  inviteId!: string;
}

export class RequestMeetupJoinDto {
  @IsString()
  meetupId!: string;
}

export class SendRoomMessageDto {
  @IsString()
  @MaxLength(2000)
  content!: string;
}
