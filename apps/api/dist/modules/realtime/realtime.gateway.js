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
var RealtimeGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const socket_io_1 = require("socket.io");
const redis_service_1 = require("../redis/redis.service");
const prisma_service_1 = require("../database/prisma.service");
function resolveCorsOrigins() {
    return (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
}
let RealtimeGateway = RealtimeGateway_1 = class RealtimeGateway {
    jwtService;
    redisService;
    presenceService;
    prisma;
    configService;
    logger = new common_1.Logger(RealtimeGateway_1.name);
    server;
    constructor(jwtService, redisService, presenceService, prisma, configService) {
        this.jwtService = jwtService;
        this.redisService = redisService;
        this.presenceService = presenceService;
        this.prisma = prisma;
        this.configService = configService;
    }
    afterInit() {
        if (this.redisService.isFallback()) {
            this.logger.warn('Socket.io running without Redis adapter (local memory mode)');
            return;
        }
        const pubClient = this.redisService.getClient();
        if (!pubClient || typeof pubClient.duplicate !== 'function') {
            this.logger.warn('Socket.io running without Redis adapter (client not ready)');
            return;
        }
        const subClient = pubClient.duplicate();
        this.server.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
        this.logger.log('Socket.io realtime gateway initialized with Redis adapter');
    }
    async handleConnection(client) {
        const token = client.handshake.auth?.token ??
            client.handshake.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            client.disconnect(true);
            return;
        }
        try {
            const payload = this.jwtService.verify(token, {
                issuer: this.configService.get('jwt.issuer', 'bitemate'),
                audience: this.configService.get('jwt.audience', 'bitemate-app'),
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                select: { isActive: true, tokenVersion: true },
            });
            if (!user?.isActive || (payload.tv ?? 0) !== user.tokenVersion) {
                client.disconnect(true);
                return;
            }
            client.data.userId = payload.sub;
            await client.join(this.userRoom(payload.sub));
            const presence = await this.presenceService?.connect(payload.sub);
            if (presence) {
                this.server.emit('presence:update', presence);
            }
            this.logger.debug(`Client connected: user=${payload.sub}`);
        }
        catch {
            client.disconnect(true);
        }
    }
    async handleDisconnect(client) {
        const userId = client.data.userId;
        if (!userId) {
            return;
        }
        const presence = await this.presenceService?.disconnect(userId);
        if (presence) {
            this.server.emit('presence:update', presence);
        }
        this.logger.debug(`Client disconnected: user=${userId}`);
    }
    handleJoinRoom(client, payload) {
        const userId = client.data.userId;
        if (!userId || !payload?.roomId) {
            return { joined: false };
        }
        void client.join(this.meetupRoom(payload.roomId));
        return { joined: true };
    }
    handleLeaveRoom(client, payload) {
        if (!payload?.roomId) {
            return { left: false };
        }
        void client.leave(this.meetupRoom(payload.roomId));
        return { left: true };
    }
    emitMeetupInvite(userId, invite) {
        this.server.to(this.userRoom(userId)).emit('meetup:invite', invite);
    }
    emitMeetupInviteAccepted(userId, invite) {
        this.server.to(this.userRoom(userId)).emit('meetup:invite:accepted', invite);
    }
    emitMeetupInviteRejected(userId, invite) {
        this.server.to(this.userRoom(userId)).emit('meetup:invite:rejected', invite);
    }
    emitRoomMessage(roomId, message) {
        this.server.to(this.meetupRoom(roomId)).emit('meetup:room:message', message);
    }
    emitRoomMemberJoined(roomId, member) {
        this.server.to(this.meetupRoom(roomId)).emit('meetup:room:member-joined', member);
    }
    emitChatMessage(chatId, message) {
        this.server.to(this.chatRoom(chatId)).emit('chat:message', message);
    }
    emitChatRead(chatId, event) {
        this.server.to(this.chatRoom(chatId)).emit('chat:read', event);
    }
    emitNotification(userId, notification) {
        this.server.to(this.userRoom(userId)).emit('notification:new', notification);
    }
    userRoom(userId) {
        return `user:${userId}`;
    }
    meetupRoom(roomId) {
        return `meetup-room:${roomId}`;
    }
    chatRoom(chatId) {
        return `chat:${chatId}`;
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealtimeGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Object)
], RealtimeGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave-room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Object)
], RealtimeGateway.prototype, "handleLeaveRoom", null);
exports.RealtimeGateway = RealtimeGateway = RealtimeGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: resolveCorsOrigins(),
            credentials: true,
        },
        namespace: '/realtime',
    }),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        redis_service_1.RedisService, Object, prisma_service_1.PrismaService,
        config_1.ConfigService])
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map