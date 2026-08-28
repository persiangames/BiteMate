import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import type {
  ChatMessageDto,
  ChatParticipantDto,
  ChatSummaryDto,
  ChatsListResponseDto,
  MessagesListResponseDto,
} from '@bitemate/shared';
import { Model, Types } from 'mongoose';
import { PrismaService } from '../database/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { Chat, ChatDocument } from './schemas/chat.schema';
import { Message, MessageDocument } from './schemas/message.schema';
import { PresenceService } from './presence.service';
import type { CreateMessageDto } from './dto/chat.dto';

type UserFields = {
  id: string;
  username: string | null;
  fullName: string | null;
  profileImage: string | null;
};

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
    @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
    private readonly prisma: PrismaService,
    private readonly presenceService: PresenceService,
    @Inject(forwardRef(() => RealtimeGateway))
    private readonly realtimeGateway: RealtimeGateway,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  async listChats(userId: string): Promise<ChatsListResponseDto> {
    const chats = await this.chatModel
      .find({ participantIds: userId })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .limit(100)
      .exec();

    const items = await Promise.all(
      chats.map((chat) => this.toChatSummary(chat, userId)),
    );

    return { items };
  }

  async getOrCreateDirectChat(
    userId: string,
    otherUserId: string,
  ): Promise<ChatSummaryDto> {
    if (userId === otherUserId) {
      throw new BadRequestException('Cannot start a chat with yourself');
    }

    const other = await this.prisma.user.findFirst({
      where: { id: otherUserId, isActive: true },
    });
    if (!other) {
      throw new NotFoundException('User not found');
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

  async ensureMeetupGroupChat(params: {
    meetupRoomId: string;
    meetupId: string;
    title: string;
    participantIds: string[];
  }): Promise<ChatDocument> {
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

  async findChatByMeetupRoomId(meetupRoomId: string): Promise<ChatDocument | null> {
    return this.chatModel.findOne({ meetupRoomId }).exec();
  }

  async getMessages(
    userId: string,
    chatId: string,
    cursor?: string,
    limit = 50,
  ): Promise<MessagesListResponseDto> {
    const chat = await this.assertChatMember(userId, chatId);
    const pageSize = Math.min(
      limit,
      this.configService.get<number>('chat.messagesPageSize', 50)!,
    );

    const query: Record<string, unknown> = {
      chatId: new Types.ObjectId(chatId),
    };

    if (cursor) {
      query._id = { $lt: new Types.ObjectId(cursor) };
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

  async sendMessage(userId: string, dto: CreateMessageDto): Promise<ChatMessageDto> {
    await this.assertChatMember(userId, dto.chatId);
    this.validateMessagePayload(dto);

    const message = await this.messageModel.create({
      chatId: new Types.ObjectId(dto.chatId),
      senderId: userId,
      type: dto.type,
      content: dto.content?.trim(),
      mediaUrl: dto.mediaUrl,
      mediaMimeType: dto.mediaMimeType,
      durationSeconds: dto.durationSeconds,
      readBy: [{ userId, readAt: new Date() }],
    });

    const preview = this.buildPreview(dto);
    await this.chatModel.updateOne(
      { _id: dto.chatId },
      {
        lastMessageAt: message.createdAt,
        lastMessagePreview: preview,
        lastMessageType: dto.type,
      },
    );

    const senders = await this.loadUsers([userId]);
    const presence = await this.presenceService.getPresenceBatch([userId]);
    const messageDto = this.toMessageDto(message, senders, presence);

    this.realtimeGateway.emitChatMessage(dto.chatId, messageDto);

    const chat = await this.chatModel.findById(dto.chatId).exec();
    const recipientIds =
      chat?.participantIds.filter((participantId) => participantId !== userId) ?? [];

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

  async markChatRead(
    userId: string,
    chatId: string,
    upToMessageId?: string,
  ): Promise<void> {
    await this.assertChatMember(userId, chatId);

    const filter: Record<string, unknown> = {
      chatId: new Types.ObjectId(chatId),
      senderId: { $ne: userId },
      'readBy.userId': { $ne: userId },
    };

    if (upToMessageId) {
      filter._id = { $lte: new Types.ObjectId(upToMessageId) };
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

  private async assertChatMember(userId: string, chatId: string): Promise<ChatDocument> {
    const chat = await this.chatModel.findById(chatId).exec();
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    if (!chat.participantIds.includes(userId)) {
      throw new ForbiddenException('Not a member of this chat');
    }
    return chat;
  }

  private validateMessagePayload(dto: CreateMessageDto): void {
    if (dto.type === 'TEXT') {
      if (!dto.content?.trim()) {
        throw new BadRequestException('Text messages require content');
      }
      return;
    }

    if (!dto.mediaUrl) {
      throw new BadRequestException('Media messages require mediaUrl');
    }
  }

  private buildPreview(dto: CreateMessageDto): string {
    switch (dto.type) {
      case 'TEXT':
        return dto.content?.trim().slice(0, 120) ?? '';
      case 'IMAGE':
        return '📷 Photo';
      case 'VIDEO':
        return '🎬 Video';
      case 'VOICE':
        return '🎤 Voice message';
      case 'FILE':
        return '📎 File';
      default:
        return 'New message';
    }
  }

  private buildDirectKey(userA: string, userB: string): string {
    return [userA, userB].sort().join(':');
  }

  private async toChatSummary(chat: ChatDocument, viewerId: string): Promise<ChatSummaryDto> {
    const participantIds = chat.participantIds;
    const users = await this.loadUsers(participantIds);
    const presence = await this.presenceService.getPresenceBatch(participantIds);

    const unreadCount = await this.messageModel.countDocuments({
      chatId: chat._id,
      senderId: { $ne: viewerId },
      'readBy.userId': { $ne: viewerId },
    });

    const participants = participantIds.map((id) =>
      this.toParticipant(users.get(id), presence.get(id)),
    );

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

  private toMessageDto(
    message: MessageDocument,
    users: Map<string, UserFields>,
    presence: Map<string, { isOnline: boolean; lastSeen: string | null }>,
  ): ChatMessageDto {
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

  private toParticipant(
    user: UserFields | undefined,
    presence?: { isOnline: boolean; lastSeen: string | null },
  ): ChatParticipantDto {
    return {
      id: user?.id ?? 'unknown',
      username: user?.username ?? null,
      fullName: user?.fullName ?? null,
      profileImage: user?.profileImage ?? null,
      isOnline: presence?.isOnline ?? false,
      lastSeen: presence?.lastSeen ?? null,
    };
  }

  private async loadUsers(userIds: string[]): Promise<Map<string, UserFields>> {
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
}
