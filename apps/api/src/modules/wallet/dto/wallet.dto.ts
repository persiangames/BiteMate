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
import { Type } from 'class-transformer';
import { CRYPTO_ASSETS, type CryptoAsset } from '@bitemate/shared';

export class DepositDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10000)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  idempotencyKey?: string;
}

export class WithdrawDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10000)
  amount!: number;

  @IsString()
  bankAccountId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  idempotencyKey?: string;
}

export class TransferDto {
  @IsString()
  recipientUserId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  @Max(5000)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  idempotencyKey?: string;
}

export class CreateBankAccountDto {
  @IsString()
  @MaxLength(120)
  bankName!: string;

  @IsString()
  @MaxLength(120)
  accountHolderName!: string;

  @IsString()
  @MaxLength(80)
  country!: string;

  @IsString()
  @MaxLength(34)
  accountNumber!: string;

  @IsOptional()
  @IsString()
  @MaxLength(34)
  routingNumber?: string;

  @IsOptional()
  @IsBoolean()
  setAsDefault?: boolean;
}

export class VerifyBankAccountDto {
  @IsString()
  @MaxLength(12)
  verificationCode!: string;
}

export class CryptoWithdrawDto {
  @IsIn(CRYPTO_ASSETS)
  asset!: CryptoAsset;

  @Type(() => Number)
  @IsNumber()
  @Min(0.00001)
  amount!: number;

  @IsString()
  @MaxLength(120)
  destinationAddress!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  idempotencyKey?: string;
}

export class CreateEscrowDto {
  @IsString()
  payeeId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  @Max(10000)
  amount!: number;

  @IsString()
  @MaxLength(60)
  referenceType!: string;

  @IsString()
  @MaxLength(120)
  referenceId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}

export class ReleaseEscrowDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  releaseNote?: string;
}

export class TransactionsQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit = 30;
}
