"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ChatGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
const presence_service_1 = require("./presence.service");
function resolveCorsOrigins() {
    return (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
}
let ChatGateway = ChatGateway_1 = class ChatGateway {
    chatService;
    presenceService;
    logger = new common_1.Logger(ChatGateway_1.name);
    constructor(chatService, presenceService) {
        this.chatService = chatService;
        this.presenceService = presenceService;
    }
    handleJoinChat(client, payload) {
        const userId = client.data.userId;
        if (!userId || !payload?.chatId) {
            return { joined: false };
        }
        void client.join(this.chatRoom(payload.chatId));
        return { joined: true };
    }
    handleLeaveChat(client, payload) {
        if (!payload?.chatId) {
            return { left: false };
        }
        void client.leave(this.chatRoom(payload.chatId));
        return { left: true };
    }
    handleTyping(client, payload) {
        const userId = client.data.userId;
        if (!userId || !payload?.chatId) {
            return;
        }
        const event = {
            chatId: payload.chatId,
            userId,
            isTyping: payload.isTyping ?? false,
        };
        client.to(this.chatRoom(payload.chatId)).emit('chat:typing', event);
    }
    async handleRead(client, payload) {
        const userId = client.data.userId;
        if (!userId || !payload?.chatId) {
            return { ok: false };
        }
        try {
            await this.chatService.markChatRead(userId, payload.chatId, payload.upToMessageId);
            return { ok: true };
        }
        catch (error) {
            this.logger.warn(`Failed to mark chat read: ${error.message}`);
            return { ok: false };
        }
    }
    chatRoom(chatId) {
        return `chat:${chatId}`;
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.SubscribeMessage)('join-chat'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Object)
], ChatGateway.prototype, "handleJoinChat", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave-chat'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Object)
], ChatGateway.prototype, "handleLeaveChat", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat:typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat:read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleRead", null);
exports.ChatGateway = ChatGateway = ChatGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: resolveCorsOrigins(),
            credentials: true,
        },
        namespace: '/realtime',
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        presence_service_1.PresenceService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map