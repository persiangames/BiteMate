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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const mongoose_2 = require("mongoose");
const prisma_service_1 = require("../database/prisma.service");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
const notifications_service_1 = require("../notifications/notifications.service");
const chat_schema_1 = require("./schemas/chat.schema");
const message_schema_1 = require("./schemas/message.schema");
const presence_service_1 = require("./presence.service");
let ChatService = class ChatService {
    chatModel;
    messageModel;
    prisma;
    presenceService;
    realtimeGateway;
    notificationsService;
    configService;
    constructor(chatModel, messageModel, prisma, presenceService, realtimeGateway, notificationsService, configService) {
        this.chatModel = chatModel;
        this.messageModel = messageModel;
        this.prisma = prisma;
        this.presenceService = presenceService;
        this.realtimeGateway = realtimeGateway;
        this.notificationsService = notificationsService;
        this.configService = configService;
    }
    async listChats(userId) {
        const chats = await this.chatModel
            .find({ participantIds: userId })
            .sort({ lastMessageAt: -1, updatedAt: -1 })
            .limit(100)
            .exec();
        const items = await Promise.all(chats.map((chat) => this.toChatSummary(chat, userId)));
        return { items };
    }
    async getOrCreateDirectChat(userId, otherUserId) {
        if (userId === otherUserId) {
            throw new common_1.BadRequestException('Cannot start a chat with yourself');
        }
        const other = await this.prisma.user.findFirst({
            where: { id: otherUserId, isActive: true },
        });
        if (!other) {
            throw new common_1.NotFoundException('User not found');
        }
        const directKey = this.buildDirectKey(userId, otherUserId);
        let chat = await this.chatModel.findOne({ directKey }).exec();
        if (!chat) {
            chat = await this.chatModel.create({
                type: 'DIRECT',
                participantIds: [userId, otherUserId],
                directKey,
            });
        }
        return this.toChatSummary(chat, userId);
    }
    async ensureMeetupGroupChat(params) {
        let chat = await this.chatModel.findOne({ meetupRoomId: params.meetupRoomId }).exec();
        if (!chat) {
            chat = await this.chatModel.create({
                type: 'MEETUP_GROUP',
                participantIds: [...new Set(params.participantIds)],
                meetupRoomId: params.meetupRoomId,
                meetupId: params.meetupId,
                title: params.title,
            });
            return chat;
        }
        const merged = [...new Set([...chat.participantIds, ...params.participantIds])];
        if (merged.length !== chat.participantIds.length) {
            chat.participantIds = merged;
            await chat.save();
        }
        return chat;
    }
    async findChatByMeetupRoomId(meetupRoomId) {
        return this.chatModel.findOne({ meetupRoomId }).exec();
    }
    async getMessages(userId, chatId, cursor, limit = 50) {
        const chat = await this.assertChatMember(userId, chatId);
        const pageSize = Math.min(limit, this.configService.get('chat.messagesPageSize', 50));
        const query = {
            chatId: new mongoose_2.Types.ObjectId(chatId),
        };
        if (cursor) {
            query._id = { $lt: new mongoose_2.Types.ObjectId(cursor) };
        }
        const messages = await this.messageModel
            .find(query)
            .sort({ createdAt: -1 })
            .limit(pageSize + 1)
            .exec();
        const hasMore = messages.length > pageSize;
        const slice = hasMore ? messages.slice(0, pageSize) : messages;
        const senderIds = [...new Set(slice.map((message) => message.senderId))];
        const senders = await this.loadUsers(senderIds);
        const presence = await this.presenceService.getPresenceBatch(senderIds);
        const items = slice
            .reverse()
            .map((message) => this.toMessageDto(message, senders, presence));
        await this.markChatRead(userId, chatId);
        return {
            items,
            nextCursor: hasMore ? slice[slice.length - 1]?.id ?? null : null,
            hasMore,
        };
    }
    async sendMessage(userId, dto) {
        await this.assertChatMember(userId, dto.chatId);
        this.validateMessagePayload(dto);
        const message = await this.messageModel.create({
            chatId: new mongoose_2.Types.ObjectId(dto.chatId),
            senderId: userId,
            type: dto.type,
            content: dto.content?.trim(),
            mediaUrl: dto.mediaUrl,
            mediaMimeType: dto.mediaMimeType,
            durationSeconds: dto.durationSeconds,
            readBy: [{ userId, readAt: new Date() }],
        });
        const preview = this.buildPreview(dto);
        await this.chatModel.updateOne({ _id: dto.chatId }, {
            lastMessageAt: message.createdAt,
            lastMessagePreview: preview,
            lastMessageType: dto.type,
        });
        const senders = await this.loadUsers([userId]);
        const presence = await this.presenceService.getPresenceBatch([userId]);
        const messageDto = this.toMessageDto(message, senders, presence);
        this.realtimeGateway.emitChatMessage(dto.chatId, messageDto);
        const chat = await this.chatModel.findById(dto.chatId).exec();
        const recipientIds = chat?.participantIds.filter((participantId) => participantId !== userId) ?? [];
        for (const recipientId of recipientIds) {
            void this.notificationsService.notify({
                userId: recipientId,
                type: 'MESSAGE_RECEIVED',
                title: 'New message',
                body: preview,
                entityId: message.id.toString(),
                dedupeKey: `chat-message:${message.id.toString()}:${recipientId}`,
                data: {
                    chatId: dto.chatId,
                    messageId: message.id.toString(),
                },
            });
        }
        return messageDto;
    }
    async markChatRead(userId, chatId, upToMessageId) {
        await this.assertChatMember(userId, chatId);
        const filter = {
            chatId: new mongoose_2.Types.ObjectId(chatId),
            senderId: { $ne: userId },
            'readBy.userId': { $ne: userId },
        };
        if (upToMessageId) {
            filter._id = { $lte: new mongoose_2.Types.ObjectId(upToMessageId) };
        }
        const now = new Date();
        const unread = await this.messageModel.find(filter).exec();
        if (!unread.length) {
            return;
        }
        await this.messageModel.updateMany(filter, {
            $push: { readBy: { userId, readAt: now } },
        });
        const messageIds = unread.map((message) => message.id);
        this.realtimeGateway.emitChatRead(chatId, {
            chatId,
            userId,
            messageIds,
            readAt: now.toISOString(),
        });
    }
    async assertChatMember(userId, chatId) {
        const chat = await this.chatModel.findById(chatId).exec();
        if (!chat) {
            throw new common_1.NotFoundException('Chat not found');
        }
        if (!chat.participantIds.includes(userId)) {
            throw new common_1.ForbiddenException('Not a member of this chat');
        }
        return chat;
    }
    validateMessagePayload(dto) {
        if (dto.type === 'TEXT') {
            if (!dto.content?.trim()) {
                throw new common_1.BadRequestException('Text messages require content');
            }
            return;
        }
        if (!dto.mediaUrl) {
            throw new common_1.BadRequestException('Media messages require mediaUrl');
        }
    }
    buildPreview(dto) {
        switch (dto.type) {
            case 'TEXT':
                return dto.content?.trim().slice(0, 120) ?? '';
            case 'IMAGE':
                return '📷 Photo';
            case 'VIDEO':
                return '🎬 Video';
            case 'VOICE':
                return '🎤 Voice message';
            default:
                return 'New message';
        }
    }
    buildDirectKey(userA, userB) {
        return [userA, userB].sort().join(':');
    }
    async toChatSummary(chat, viewerId) {
        const participantIds = chat.participantIds;
        const users = await this.loadUsers(participantIds);
        const presence = await this.presenceService.getPresenceBatch(participantIds);
        const unreadCount = await this.messageModel.countDocuments({
            chatId: chat._id,
            senderId: { $ne: viewerId },
            'readBy.userId': { $ne: viewerId },
        });
        const participants = participantIds.map((id) => this.toParticipant(users.get(id), presence.get(id)));
        let title = chat.title ?? null;
        if (chat.type === 'DIRECT') {
            const other = participants.find((participant) => participant.id !== viewerId);
            title = other?.fullName ?? other?.username ?? 'Direct chat';
        }
        return {
            id: chat.id,
            type: chat.type,
            title,
            meetupRoomId: chat.meetupRoomId ?? null,
            participants,
            lastMessageAt: chat.lastMessageAt?.toISOString() ?? null,
            lastMessagePreview: chat.lastMessagePreview ?? null,
            lastMessageType: chat.lastMessageType ?? null,
            unreadCount,
        };
    }
    toMessageDto(message, users, presence) {
        const sender = users.get(message.senderId);
        return {
            id: message.id,
            chatId: message.chatId.toString(),
            senderId: message.senderId,
            type: message.type,
            content: message.content ?? null,
            mediaUrl: message.mediaUrl ?? null,
            mediaMimeType: message.mediaMimeType ?? null,
            durationSeconds: message.durationSeconds ?? null,
            readBy: message.readBy.map((receipt) => ({
                userId: receipt.userId,
                readAt: receipt.readAt.toISOString(),
            })),
            createdAt: message.createdAt.toISOString(),
            sender: this.toParticipant(sender, presence.get(message.senderId)),
        };
    }
    toParticipant(user, presence) {
        return {
            id: user?.id ?? 'unknown',
            username: user?.username ?? null,
            fullName: user?.fullName ?? null,
            profileImage: user?.profileImage ?? null,
            isOnline: presence?.isOnline ?? false,
            lastSeen: presence?.lastSeen ?? null,
        };
    }
    async loadUsers(userIds) {
        const users = await this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: {
                id: true,
                username: true,
                fullName: true,
                profileImage: true,
            },
        });
        return new Map(users.map((user) => [user.id, user]));
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(chat_schema_1.Chat.name)),
    __param(1, (0, mongoose_1.InjectModel)(message_schema_1.Message.name)),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => realtime_gateway_1.RealtimeGateway))),
    __param(5, (0, common_1.Inject)((0, common_1.forwardRef)(() => notifications_service_1.NotificationsService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        prisma_service_1.PrismaService,
        presence_service_1.PresenceService,
        realtime_gateway_1.RealtimeGateway,
        notifications_service_1.NotificationsService,
        config_1.ConfigService])
], ChatService);
//# sourceMappingURL=chat.service.js.map