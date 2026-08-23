import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class RankingsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit = 30;
}

export class PremiumSubscribeDto {
  @IsOptional()
  @IsIn(['WALLET', 'STRIPE'])
  paymentMethod?: 'WALLET' | 'STRIPE';

  @IsOptional()
  @IsString()
  @MaxLength(120)
  idempotencyKey?: string;
}

export class CreateRestaurantAdDto {
  @IsString()
  restaurantId!: string;

  @IsString()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  targetUrl?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(10)
  @Max(10000)
  budget!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(90)
  @IsOptional()
  durationDays?: number;
}

export class AdClickDto {
  @IsOptional()
  @IsString()
  referrerUserId?: string;
}

export class CreateMeetupReviewDto {
  @IsString()
  meetupId!: string;

  @IsString()
  reviewedUserId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}
