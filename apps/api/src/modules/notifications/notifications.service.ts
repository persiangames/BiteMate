import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  NotificationDto,
  NotificationSettingsDto,
  NotificationsListResponseDto,
  NotificationType,
  SendNotificationRequestDto,
  UpdateNotificationSettingsRequestDto,
} from '@bitemate/shared';
import type { Notification, NotificationSettings, Prisma } from '@prisma/client';
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

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly queueService: NotificationQueueService,
    private readonly configService: ConfigService,
  ) {}

  async notify(payload: NotifyPayload): Promise<NotificationDto | null> {
    const dedupeKey =
      payload.dedupeKey ??
      `${payload.userId}:${payload.type}:${payload.entityId ?? payload.title}`;

    const acquired = await this.acquireDedupe(dedupeKey);
    if (!acquired) {
      const existing = await this.prisma.notification.findUnique({
        where: { dedupeKey },
      });
      return existing ? this.toDto(existing) : null;
    }

    const notification = await this.prisma.notification.create({
      data: {
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: payload.data as Prisma.InputJsonValue | undefined,
        entityId: payload.entityId,
        dedupeKey,
      },
    });

    await this.queueService.enqueue({ notificationId: notification.id, attempt: 0 });
    return this.toDto(notification);
  }

  async send(
    senderUserId: string,
    payload: SendNotificationRequestDto,
    sendSecret?: string,
  ): Promise<NotificationDto | null> {
    const configuredSecret = this.configService.get<string>('notification.sendSecret', '');
    const isSystemSend = Boolean(configuredSecret && sendSecret === configuredSecret);

    if (!isSystemSend && payload.recipientUserId !== senderUserId) {
      throw new ForbiddenException('Not allowed to send notifications to other users');
    }

    return this.notify({
      userId: payload.recipientUserId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      data: payload.data,
      entityId: payload.entityId,
      dedupeKey: payload.dedupeKey,
    });
  }

  async listNotifications(
    userId: string,
    cursor?: string,
  ): Promise<NotificationsListResponseDto> {
    const pageSize = this.configService.get<number>('notification.pageSize', 30)!;

    const items = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: pageSize + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
    });

    const hasMore = items.length > pageSize;
    const page = hasMore ? items.slice(0, pageSize) : items;
    const unreadCount = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });

    return {
      items: page.map((item) => this.toDto(item)),
      unreadCount,
      nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null,
      hasMore,
    };
  }

  async markRead(userId: string, notificationId: string): Promise<NotificationDto> {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: notification.readAt ?? new Date() },
    });

    return this.toDto(updated);
  }

  async markAllRead(userId: string): Promise<{ updated: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { updated: result.count };
  }

  async getSettings(userId: string): Promise<NotificationSettingsDto> {
    const settings = await this.getSettingsRecord(userId);
    return {
      muted: settings.muted,
      disabledTypes: this.parseDisabledTypes(settings.disabledTypes),
    };
  }

  async updateSettings(
    userId: string,
    payload: UpdateNotificationSettingsRequestDto,
  ): Promise<NotificationSettingsDto> {
    await this.getSettingsRecord(userId);

    const updated = await this.prisma.notificationSettings.update({
      where: { userId },
      data: {
        ...(payload.muted !== undefined ? { muted: payload.muted } : {}),
        ...(payload.disabledTypes !== undefined
          ? { disabledTypes: payload.disabledTypes }
          : {}),
      },
    });

    return {
      muted: updated.muted,
      disabledTypes: this.parseDisabledTypes(updated.disabledTypes),
    };
  }

  async registerDeviceToken(
    userId: string,
    token: string,
    platform = 'web',
  ): Promise<void> {
    await this.prisma.deviceToken.upsert({
      where: { token },
      create: { userId, token, platform },
      update: { userId, platform, updatedAt: new Date() },
    });
  }

  async getSettingsRecord(userId: string): Promise<NotificationSettings> {
    return this.prisma.notificationSettings.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  parseDisabledTypes(value: unknown): NotificationType[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value.filter((item): item is NotificationType => typeof item === 'string');
  }

  toDto(notification: Notification): NotificationDto {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: (notification.data as Record<string, unknown> | null) ?? null,
      entityId: notification.entityId,
      readAt: notification.readAt?.toISOString() ?? null,
      deliveredAt: notification.deliveredAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString(),
    };
  }

  private async acquireDedupe(dedupeKey: string): Promise<boolean> {
    const prefix = this.configService.get<string>(
      'notification.dedupePrefix',
      'bitemate:notifications:dedup:',
    )!;
    const ttl = this.configService.get<number>('notification.dedupeTtlSeconds', 86400)!;
    const client = this.redisService.getClient();
    const result = await client.set(`${prefix}${dedupeKey}`, '1', 'EX', ttl, 'NX');
    return result === 'OK';
  }
}
