import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { NOTIFICATION_TYPES, type NotificationType } from '@bitemate/shared';

export class SendNotificationDto {
  @IsString()
  recipientUserId!: string;

  @IsIn(NOTIFICATION_TYPES)
  type!: NotificationType;

  @IsString()
  @MaxLength(160)
  title!: string;

  @IsString()
  @MaxLength(500)
  body!: string;

  @IsOptional()
  data?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsString()
  dedupeKey?: string;
}

export class NotificationListQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;
}

export class UpdateNotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  muted?: boolean;

  @IsOptional()
  @IsArray()
  @IsIn(NOTIFICATION_TYPES, { each: true })
  disabledTypes?: NotificationType[];
}

export class MarkNotificationReadDto {
  @IsString()
  notificationId!: string;
}

export class RegisterDeviceTokenDto {
  @IsString()
  @MaxLength(512)
  token!: string;

  @IsOptional()
  @IsIn(['web', 'ios', 'android'])
  platform?: 'web' | 'ios' | 'android';
}
