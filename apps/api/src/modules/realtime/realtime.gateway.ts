import {

  ConnectedSocket,

  MessageBody,

  OnGatewayConnection,

  OnGatewayDisconnect,

  OnGatewayInit,

  SubscribeMessage,

  WebSocketGateway,

  WebSocketServer,

} from '@nestjs/websockets';

import { Logger, Optional } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { JwtService } from '@nestjs/jwt';

import { createAdapter } from '@socket.io/redis-adapter';

import type {

  ChatMessageDto,

  ChatReadEventDto,

  MeetupInviteDto,

  MeetupRoomMessageDto,

  MeetupUserSummaryDto,

  NotificationDto,

} from '@bitemate/shared';

import { Server, Socket } from 'socket.io';

import type { JwtPayload } from '../auth/types/jwt-payload.type';

import { RedisService } from '../redis/redis.service';

import { PrismaService } from '../database/prisma.service';

import { PresenceService } from '../chat/presence.service';



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

export class RealtimeGateway

  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect

{

  private readonly logger = new Logger(RealtimeGateway.name);



  @WebSocketServer()

  server!: Server;



  constructor(

    private readonly jwtService: JwtService,

    private readonly redisService: RedisService,

    @Optional() private readonly presenceService: PresenceService | null,

    private readonly prisma: PrismaService,

    private readonly configService: ConfigService,

  ) {}



  afterInit(): void {
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
    this.server.adapter(createAdapter(pubClient, subClient));
    this.logger.log('Socket.io realtime gateway initialized with Redis adapter');
  }

  async handleConnection(client: Socket): Promise<void> {

    const token =

      (client.handshake.auth?.token as string | undefined) ??

      (client.handshake.headers.authorization?.replace('Bearer ', '') as string);



    if (!token) {

      client.disconnect(true);

      return;

    }



    try {

      const payload = this.jwtService.verify<JwtPayload>(token, {

        issuer: this.configService.get<string>('jwt.issuer', 'bitemate'),

        audience: this.configService.get<string>('jwt.audience', 'bitemate-app'),

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

    } catch {

      client.disconnect(true);

    }

  }



  async handleDisconnect(client: Socket): Promise<void> {

    const userId = client.data.userId as string | undefined;

    if (!userId) {

      return;

    }



    const presence = await this.presenceService?.disconnect(userId);

    if (presence) {
      this.server.emit('presence:update', presence);
    }

    this.logger.debug(`Client disconnected: user=${userId}`);

  }



  @SubscribeMessage('join-room')

  handleJoinRoom(

    @ConnectedSocket() client: Socket,

    @MessageBody() payload: { roomId?: string },

  ): { joined: boolean } {

    const userId = client.data.userId as string | undefined;

    if (!userId || !payload?.roomId) {

      return { joined: false };

    }



    void client.join(this.meetupRoom(payload.roomId));

    return { joined: true };

  }



  @SubscribeMessage('leave-room')

  handleLeaveRoom(

    @ConnectedSocket() client: Socket,

    @MessageBody() payload: { roomId?: string },

  ): { left: boolean } {

    if (!payload?.roomId) {

      return { left: false };

    }



    void client.leave(this.meetupRoom(payload.roomId));

    return { left: true };

  }



  emitMeetupInvite(userId: string, invite: MeetupInviteDto): void {

    this.server.to(this.userRoom(userId)).emit('meetup:invite', invite);

  }



  emitMeetupInviteAccepted(userId: string, invite: MeetupInviteDto): void {

    this.server.to(this.userRoom(userId)).emit('meetup:invite:accepted', invite);

  }



  emitMeetupInviteRejected(userId: string, invite: MeetupInviteDto): void {

    this.server.to(this.userRoom(userId)).emit('meetup:invite:rejected', invite);

  }



  /** @deprecated Use emitChatMessage */

  emitRoomMessage(roomId: string, message: MeetupRoomMessageDto): void {

    this.server.to(this.meetupRoom(roomId)).emit('meetup:room:message', message);

  }



  emitRoomMemberJoined(roomId: string, member: MeetupUserSummaryDto): void {

    this.server.to(this.meetupRoom(roomId)).emit('meetup:room:member-joined', member);

  }



  emitChatMessage(chatId: string, message: ChatMessageDto): void {

    this.server.to(this.chatRoom(chatId)).emit('chat:message', message);

  }



  emitChatRead(chatId: string, event: ChatReadEventDto): void {

    this.server.to(this.chatRoom(chatId)).emit('chat:read', event);

  }



  emitNotification(userId: string, notification: NotificationDto): void {

    this.server.to(this.userRoom(userId)).emit('notification:new', notification);

  }



  private userRoom(userId: string): string {

    return `user:${userId}`;

  }



  private meetupRoom(roomId: string): string {

    return `meetup-room:${roomId}`;

  }



  private chatRoom(chatId: string): string {

    return `chat:${chatId}`;

  }

}


