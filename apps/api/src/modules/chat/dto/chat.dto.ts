import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CHAT_MESSAGE_TYPES, type ChatMessageType } from '@bitemate/shared';

export class CreateMessageDto {
  @IsString()
  chatId!: string;

  @IsEnum(CHAT_MESSAGE_TYPES)
  type!: ChatMessageType;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  content?: string;

  @IsOptional()
  @IsUrl()
  mediaUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  mediaMimeType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3600)
  durationSeconds?: number;
}

export class CreateDirectChatDto {
  @IsString()
  userId!: string;
}

export class MessagesQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 50;
}

export class MarkChatReadDto {
  @IsOptional()
  @IsString()
  upToMessageId?: string;
}
