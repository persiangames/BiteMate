import { ConfigService } from '@nestjs/config';
import type { NotificationDto, NotificationSettingsDto, NotificationsListResponseDto, NotificationType, SendNotificationRequestDto, UpdateNotificationSettingsRequestDto } from '@bitemate/shared';
import type { Notification, NotificationSettings } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { NotificationQueueService } from './notification-queue.service';
export interface NotifyPayload {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    entityId?: string;
    dedupeKey?: string;
}
export declare class NotificationsService {
    private readonly prisma;
    private readonly redisService;
    private readonly queueService;
    private readonly configService;
    constructor(prisma: PrismaService, redisService: RedisService, queueService: NotificationQueueService, configService: ConfigService);
    notify(payload: NotifyPayload): Promise<NotificationDto | null>;
    send(senderUserId: string, payload: SendNotificationRequestDto, sendSecret?: string): Promise<NotificationDto | null>;
    listNotifications(userId: string, cursor?: string): Promise<NotificationsListResponseDto>;
    markRead(userId: string, notificationId: string): Promise<NotificationDto>;
    markAllRead(userId: string): Promise<{
        updated: number;
    }>;
    getSettings(userId: string): Promise<NotificationSettingsDto>;
    updateSettings(userId: string, payload: UpdateNotificationSettingsRequestDto): Promise<NotificationSettingsDto>;
    registerDeviceToken(userId: string, token: string, platform?: string): Promise<void>;
    getSettingsRecord(userId: string): Promise<NotificationSettings>;
    parseDisabledTypes(value: unknown): NotificationType[];
    toDto(notification: Notification): NotificationDto;
    private acquireDedupe;
}
