import { type NotificationType } from '@bitemate/shared';
export declare class SendNotificationDto {
    recipientUserId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    entityId?: string;
    dedupeKey?: string;
}
export declare class NotificationListQueryDto {
    cursor?: string;
}
export declare class UpdateNotificationSettingsDto {
    muted?: boolean;
    disabledTypes?: NotificationType[];
}
export declare class MarkNotificationReadDto {
    notificationId: string;
}
export declare class RegisterDeviceTokenDto {
    token: string;
    platform?: 'web' | 'ios' | 'android';
}
