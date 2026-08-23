import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import type { ChatTypingEventDto } from '@bitemate/shared';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { PresenceService } from './presence.service';

function resolveCorsOrigins(): string[] {
  return (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

@WebSocketGateway({
  cors: {
    origin: resolveCorsOrigins(),
    credentials: true,
  },
  namespace: '/realtime',
})
export class ChatGateway {
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly presenceService: PresenceService,
  ) {}

  @SubscribeMessage('join-chat')
  handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatId?: string },
  ): { joined: boolean } {
    const userId = client.data.userId as string | undefined;
    if (!userId || !payload?.chatId) {
      return { joined: false };
    }

    void client.join(this.chatRoom(payload.chatId));
    return { joined: true };
  }

  @SubscribeMessage('leave-chat')
  handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatId?: string },
  ): { left: boolean } {
    if (!payload?.chatId) {
      return { left: false };
    }

    void client.leave(this.chatRoom(payload.chatId));
    return { left: true };
  }

  @SubscribeMessage('chat:typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatId?: string; isTyping?: boolean },
  ): void {
    const userId = client.data.userId as string | undefined;
    if (!userId || !payload?.chatId) {
      return;
    }

    const event: ChatTypingEventDto = {
      chatId: payload.chatId,
      userId,
      isTyping: payload.isTyping ?? false,
    };

    client.to(this.chatRoom(payload.chatId)).emit('chat:typing', event);
  }

  @SubscribeMessage('chat:read')
  async handleRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatId?: string; upToMessageId?: string },
  ): Promise<{ ok: boolean }> {
    const userId = client.data.userId as string | undefined;
    if (!userId || !payload?.chatId) {
      return { ok: false };
    }

    try {
      await this.chatService.markChatRead(userId, payload.chatId, payload.upToMessageId);
      return { ok: true };
    } catch (error) {
      this.logger.warn(`Failed to mark chat read: ${(error as Error).message}`);
      return { ok: false };
    }
  }

  private chatRoom(chatId: string): string {
    return `chat:${chatId}`;
  }
}
