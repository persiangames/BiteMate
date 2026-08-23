export declare const CHAT_TYPES: readonly ["DIRECT", "MEETUP_GROUP"];
export type ChatType = (typeof CHAT_TYPES)[number];
export declare const CHAT_MESSAGE_TYPES: readonly ["TEXT", "IMAGE", "VIDEO", "VOICE"];
export type ChatMessageType = (typeof CHAT_MESSAGE_TYPES)[number];
export interface ChatParticipantDto {
    id: string;
    username: string | null;
    fullName: string | null;
    profileImage: string | null;
    isOnline: boolean;
    lastSeen: string | null;
}
export interface ChatSummaryDto {
    id: string;
    type: ChatType;
    title: string | null;
    meetupRoomId: string | null;
    participants: ChatParticipantDto[];
    lastMessageAt: string | null;
    lastMessagePreview: string | null;
    lastMessageType: ChatMessageType | null;
    unreadCount: number;
}
export interface ChatsListResponseDto {
    items: ChatSummaryDto[];
}
export interface ChatMessageDto {
    id: string;
    chatId: string;
    senderId: string;
    type: ChatMessageType;
    content: string | null;
    mediaUrl: string | null;
    mediaMimeType: string | null;
    durationSeconds: number | null;
    readBy: Array<{
        userId: string;
        readAt: string;
    }>;
    createdAt: string;
    sender: ChatParticipantDto;
}
export interface MessagesListResponseDto {
    items: ChatMessageDto[];
    nextCursor: string | null;
    hasMore: boolean;
}
export interface CreateMessageRequestDto {
    chatId: string;
    type: ChatMessageType;
    content?: string;
    mediaUrl?: string;
    mediaMimeType?: string;
    durationSeconds?: number;
}
export interface CreateDirectChatRequestDto {
    userId: string;
}
export interface ChatTypingEventDto {
    chatId: string;
    userId: string;
    isTyping: boolean;
}
export interface ChatReadEventDto {
    chatId: string;
    userId: string;
    messageIds: string[];
    readAt: string;
}
export interface UserPresenceDto {
    userId: string;
    isOnline: boolean;
    lastSeen: string | null;
}
//# sourceMappingURL=chat.dto.d.ts.map