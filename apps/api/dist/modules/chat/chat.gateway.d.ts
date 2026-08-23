import { Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { PresenceService } from './presence.service';
export declare class ChatGateway {
    private readonly chatService;
    private readonly presenceService;
    private readonly logger;
    constructor(chatService: ChatService, presenceService: PresenceService);
    handleJoinChat(client: Socket, payload: {
        chatId?: string;
    }): {
        joined: boolean;
    };
    handleLeaveChat(client: Socket, payload: {
        chatId?: string;
    }): {
        left: boolean;
    };
    handleTyping(client: Socket, payload: {
        chatId?: string;
        isTyping?: boolean;
    }): void;
    handleRead(client: Socket, payload: {
        chatId?: string;
        upToMessageId?: string;
    }): Promise<{
        ok: boolean;
    }>;
    private chatRoom;
}
