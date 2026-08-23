import { type ChatMessageType } from '@bitemate/shared';
export declare class CreateMessageDto {
    chatId: string;
    type: ChatMessageType;
    content?: string;
    mediaUrl?: string;
    mediaMimeType?: string;
    durationSeconds?: number;
}
export declare class CreateDirectChatDto {
    userId: string;
}
export declare class MessagesQueryDto {
    cursor?: string;
    limit: number;
}
export declare class MarkChatReadDto {
    upToMessageId?: string;
}
