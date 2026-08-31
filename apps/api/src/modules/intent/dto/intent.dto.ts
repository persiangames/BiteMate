import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
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

export class CreateIntentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  foodType!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  foodCategory?: string;

  @IsString()
  timeStart!: string;

  @IsOptional()
  @IsString()
  timeEnd?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
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
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  budgetMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  budgetMax?: number;

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

  @IsOptional()
  @IsString()
  @MaxLength(120)
  locationLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(900)
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(PROFILE_INTERESTS, { each: true })
  preferredInterests?: ProfileInterest[];
}

export class IntentMatchQueryDto {
  @IsString()
  intentId!: string;
}

export class CancelIntentDto {
  @IsString()
  intentId!: string;
}
