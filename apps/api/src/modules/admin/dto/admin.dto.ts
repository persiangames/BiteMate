import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  ABUSE_REPORT_STATUSES,
  ABUSE_REPORT_TARGET_TYPES,
  RESTAURANT_APPROVAL_STATUSES,
} from '@bitemate/shared';

export class AdminListQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit = 20;
}

export class AdminUsersQueryDto extends AdminListQueryDto {
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === '') {
      return undefined;
    }
    return value === true || value === 'true';
  })
  @IsBoolean()
  isActive?: boolean;
}

export class AdminRestaurantsQueryDto extends AdminListQueryDto {
  @IsOptional()
  @IsIn(RESTAURANT_APPROVAL_STATUSES)
  approvalStatus?: (typeof RESTAURANT_APPROVAL_STATUSES)[number];
}

export class AdminTransactionsQueryDto extends AdminListQueryDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class AdminReportsQueryDto extends AdminListQueryDto {
  @IsOptional()
  @IsIn(ABUSE_REPORT_STATUSES)
  status?: (typeof ABUSE_REPORT_STATUSES)[number];
}

export class AdminFraudQueryDto extends AdminListQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minRiskScore?: number;
}

export class BanUserDto {
  @IsBoolean()
  banned!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}

export class VerifyUserDto {
  @IsBoolean()
  verified!: boolean;
}

export class UpdateRestaurantListingDto {
  @IsOptional()
  @IsIn(RESTAURANT_APPROVAL_STATUSES)
  approvalStatus?: (typeof RESTAURANT_APPROVAL_STATUSES)[number];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAbuseReportDto {
  @IsIn(ABUSE_REPORT_STATUSES)
  status!: (typeof ABUSE_REPORT_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  resolutionNote?: string;
}

export class CreateAbuseReportDto {
  @IsIn(ABUSE_REPORT_TARGET_TYPES)
  targetType!: (typeof ABUSE_REPORT_TARGET_TYPES)[number];

  @IsString()
  targetId!: string;

  @IsString()
  @MaxLength(120)
  reason!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  details?: string;
}

export class UpdateCommissionStatusDto {
  @IsIn(['APPROVED', 'PAID', 'REJECTED'])
  status!: 'APPROVED' | 'PAID' | 'REJECTED';
}
