import type { NotificationDto, NotificationSettingsDto, NotificationsListResponseDto } from '@bitemate/shared';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { MarkNotificationReadDto, NotificationListQueryDto, RegisterDeviceTokenDto, SendNotificationDto, UpdateNotificationSettingsDto } from './dto/notifications.dto';
import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    sendNotification(user: JwtPayload, dto: SendNotificationDto, sendSecret?: string): Promise<NotificationDto | null>;
    listNotifications(user: JwtPayload, query: NotificationListQueryDto): Promise<NotificationsListResponseDto>;
    updateSettings(user: JwtPayload, dto: UpdateNotificationSettingsDto): Promise<NotificationSettingsDto>;
    getSettings(user: JwtPayload): Promise<NotificationSettingsDto>;
    markRead(user: JwtPayload, dto: MarkNotificationReadDto): Promise<NotificationDto>;
    markAllRead(user: JwtPayload): Promise<{
        updated: number;
    }>;
    registerDevice(user: JwtPayload, dto: RegisterDeviceTokenDto): Promise<{
        registered: true;
    }>;
}
