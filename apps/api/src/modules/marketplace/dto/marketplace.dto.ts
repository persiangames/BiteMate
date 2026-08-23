import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  BOOKING_TYPES,
  DAYS_OF_WEEK,
  REVIEW_TARGET_TYPES,
  type BookingType,
  type DayOfWeek,
  type ReviewTargetType,
} from '@bitemate/shared';

export class OpeningHourDto {
  @IsEnum(DAYS_OF_WEEK)
  dayOfWeek!: DayOfWeek;

  @IsString()
  @MaxLength(5)
  openTime!: string;

  @IsString()
  @MaxLength(5)
  closeTime!: string;

  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;
}

export class CreateRestaurantDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsUrl()
  profileImage?: string;

  @IsOptional()
  @IsUrl()
  coverImage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  country?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phoneNumber?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cuisineTypes?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OpeningHourDto)
  openingHours?: OpeningHourDto[];
}

export class RestaurantsQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 20;
}

export class CreateRestaurantMenuItemDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  price!: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  category?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class HomeChefAvailabilityDto {
  @IsEnum(DAYS_OF_WEEK)
  dayOfWeek!: DayOfWeek;

  @IsString()
  @MaxLength(5)
  startTime!: string;

  @IsString()
  @MaxLength(5)
  endTime!: string;
}

export class CreateHomeChefProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @IsOptional()
  @IsBoolean()
  acceptsOrders?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HomeChefAvailabilityDto)
  availability?: HomeChefAvailabilityDto[];
}

export class CreateHomeChefMenuDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  price!: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsString()
  availableDate!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  servingsAvailable!: number;
}

export class HomeChefMenuQueryDto {
  @IsOptional()
  @IsString()
  chefId?: string;

  @IsOptional()
  @IsString()
  date?: string;
}

export class CreateBookingDto {
  @IsEnum(BOOKING_TYPES)
  type!: BookingType;

  @IsOptional()
  @IsString()
  restaurantId?: string;

  @IsOptional()
  @IsString()
  homeChefMenuItemId?: string;

  @IsString()
  bookingDate!: string;

  @IsString()
  @MaxLength(5)
  bookingTime!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  partySize?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  quantity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsString()
  affiliateReferrerId?: string;
}

export class UpdateBookingStatusDto {
  @IsEnum(['CONFIRMED', 'CANCELLED', 'COMPLETED'] as const)
  status!: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

export class CreateReviewDto {
  @IsEnum(REVIEW_TARGET_TYPES)
  targetType!: ReviewTargetType;

  @IsOptional()
  @IsString()
  restaurantId?: string;

  @IsOptional()
  @IsString()
  homeChefProfileId?: string;

  @IsOptional()
  @IsString()
  bookingId?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  text?: string;
}

export class ReviewsQueryDto {
  @IsOptional()
  @IsString()
  restaurantId?: string;

  @IsOptional()
  @IsString()
  homeChefProfileId?: string;

  @IsOptional()
  @IsString()
  cursor?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 20;
}
