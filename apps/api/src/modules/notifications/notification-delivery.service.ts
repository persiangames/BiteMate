import { Injectable } from '@nestjs/common';
import type { NotificationDto, NotificationType } from '@bitemate/shared';
import type { Notification } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { PresenceService } from '../chat/presence.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { FcmService } from './fcm.service';

@Injectable()
export class NotificationDeliveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly presenceService: PresenceService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly fcmService: FcmService,
  ) {}

  async deliver(notificationId: string): Promise<boolean> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return true;
    }

    if (notification.deliveredAt) {
      return true;
    }

    const settings = await this.prisma.notificationSettings.upsert({
      where: { userId: notification.userId },
      create: { userId: notification.userId },
      update: {},
    });

    if (settings.muted) {
      await this.markDelivered(notification.id);
      return true;
    }

    const disabledTypes = this.parseDisabledTypes(settings.disabledTypes);
    if (disabledTypes.includes(notification.type)) {
      await this.markDelivered(notification.id);
      return true;
    }

    const dto = this.toDto(notification);
    const presence = await this.presenceService.getPresence(notification.userId);
    let delivered = false;

    if (presence.isOnline) {
      this.realtimeGateway.emitNotification(notification.userId, dto);
      delivered = true;
    }

    const tokens = await this.prisma.deviceToken.findMany({
      where: { userId: notification.userId },
      select: { token: true },
    });

    if (!presence.isOnline && tokens.length && this.fcmService.isConfigured()) {
      const result = await this.fcmService.sendToTokens({
        tokens: tokens.map((entry) => entry.token),
        title: notification.title,
        body: notification.body,
        data: this.stringifyData(notification),
      });
      delivered = delivered || result.successCount > 0;
    } else if (presence.isOnline) {
      delivered = true;
    }

    if (delivered) {
      await this.markDelivered(notification.id);
      return true;
    }

    return false;
  }

  private async markDelivered(notificationId: string): Promise<void> {
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { deliveredAt: new Date() },
    });
  }

  private parseDisabledTypes(value: unknown): NotificationType[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value.filter((item): item is NotificationType => typeof item === 'string');
  }

  private toDto(notification: Notification): NotificationDto {
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

  private stringifyData(notification: Notification): Record<string, string> {
    const payload: Record<string, string> = {
      notificationId: notification.id,
      type: notification.type,
      entityId: notification.entityId ?? '',
    };

    if (notification.data && typeof notification.data === 'object') {
      for (const [key, value] of Object.entries(notification.data as Record<string, unknown>)) {
        payload[key] = typeof value === 'string' ? value : JSON.stringify(value);
      }
    }

    return payload;
  }
}
