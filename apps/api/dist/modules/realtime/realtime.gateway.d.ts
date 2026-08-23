import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { ChatMessageDto, ChatReadEventDto, MeetupInviteDto, MeetupRoomMessageDto, MeetupUserSummaryDto, NotificationDto } from '@bitemate/shared';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../database/prisma.service';
import { PresenceService } from '../chat/presence.service';
export declare class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly redisService;
    private readonly presenceService;
    private readonly prisma;
    private readonly configService;
    private readonly logger;
    server: Server;
    constructor(jwtService: JwtService, redisService: RedisService, presenceService: PresenceService | null, prisma: PrismaService, configService: ConfigService);
    afterInit(): void;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleJoinRoom(client: Socket, payload: {
        roomId?: string;
    }): {
        joined: boolean;
    };
    handleLeaveRoom(client: Socket, payload: {
        roomId?: string;
    }): {
        left: boolean;
    };
    emitMeetupInvite(userId: string, invite: MeetupInviteDto): void;
    emitMeetupInviteAccepted(userId: string, invite: MeetupInviteDto): void;
    emitMeetupInviteRejected(userId: string, invite: MeetupInviteDto): void;
    emitRoomMessage(roomId: string, message: MeetupRoomMessageDto): void;
    emitRoomMemberJoined(roomId: string, member: MeetupUserSummaryDto): void;
    emitChatMessage(chatId: string, message: ChatMessageDto): void;
    emitChatRead(chatId: string, event: ChatReadEventDto): void;
    emitNotification(userId: string, notification: NotificationDto): void;
    private userRoom;
    private meetupRoom;
    private chatRoom;
}
