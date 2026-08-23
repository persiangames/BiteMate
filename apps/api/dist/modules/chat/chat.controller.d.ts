import type { ChatMessageDto, ChatSummaryDto, ChatsListResponseDto, MessagesListResponseDto } from '@bitemate/shared';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { ChatService } from './chat.service';
import { CreateDirectChatDto, CreateMessageDto, MarkChatReadDto, MessagesQueryDto } from './dto/chat.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    listChats(user: JwtPayload): Promise<ChatsListResponseDto>;
    createDirectChat(user: JwtPayload, dto: CreateDirectChatDto): Promise<ChatSummaryDto>;
    sendMessage(user: JwtPayload, dto: CreateMessageDto): Promise<ChatMessageDto>;
    getMessages(user: JwtPayload, chatId: string, query: MessagesQueryDto): Promise<MessagesListResponseDto>;
    markRead(user: JwtPayload, chatId: string, dto: MarkChatReadDto): Promise<{
        ok: true;
    }>;
}
