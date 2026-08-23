import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type {
  ChatMessageDto,
  ChatSummaryDto,
  ChatsListResponseDto,
  MessagesListResponseDto,
} from '@bitemate/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireOtpVerified } from '../../common/decorators/auth.decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OtpVerifiedGuard } from '../../common/guards/otp-verified.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { ChatService } from './chat.service';
import {
  CreateDirectChatDto,
  CreateMessageDto,
  MarkChatReadDto,
  MessagesQueryDto,
} from './dto/chat.dto';

@Controller()
@UseGuards(JwtAuthGuard, OtpVerifiedGuard, RolesGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('chats')
  @RequireOtpVerified()
  listChats(@CurrentUser() user: JwtPayload): Promise<ChatsListResponseDto> {
    return this.chatService.listChats(user.sub);
  }

  @Post('chats/direct')
  @RequireOtpVerified()
  createDirectChat(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateDirectChatDto,
  ): Promise<ChatSummaryDto> {
    return this.chatService.getOrCreateDirectChat(user.sub, dto.userId);
  }

  @Post('messages')
  @RequireOtpVerified()
  sendMessage(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateMessageDto,
  ): Promise<ChatMessageDto> {
    return this.chatService.sendMessage(user.sub, dto);
  }

  @Get('messages/:chatId')
  @RequireOtpVerified()
  getMessages(
    @CurrentUser() user: JwtPayload,
    @Param('chatId') chatId: string,
    @Query() query: MessagesQueryDto,
  ): Promise<MessagesListResponseDto> {
    return this.chatService.getMessages(user.sub, chatId, query.cursor, query.limit);
  }

  @Post('messages/:chatId/read')
  @RequireOtpVerified()
  markRead(
    @CurrentUser() user: JwtPayload,
    @Param('chatId') chatId: string,
    @Body() dto: MarkChatReadDto,
  ): Promise<{ ok: true }> {
    return this.chatService
      .markChatRead(user.sub, chatId, dto.upToMessageId)
      .then(() => ({ ok: true as const }));
  }
}
