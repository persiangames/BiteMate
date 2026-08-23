export declare const NOTIFICATION_TYPES: readonly ["MEETUP_INVITATION", "MEETUP_ACCEPTED", "MATCH_FOUND", "MESSAGE_RECEIVED", "PAYMENT_RECEIVED", "RANKING_UPDATE", "POST_LIKE", "POST_COMMENT", "POST_TAG", "NEW_FOLLOWER"];
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
export interface NotificationDto {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    data: Record<string, unknown> | null;
    entityId: string | null;
    readAt: string | null;
    deliveredAt: string | null;
    createdAt: string;
}
export interface NotificationsListResponseDto {
    items: NotificationDto[];
    unreadCount: number;
    nextCursor: string | null;
    hasMore: boolean;
}
export interface SendNotificationRequestDto {
    recipientUserId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    entityId?: string;
    dedupeKey?: string;
}
export interface NotificationSettingsDto {
    muted: boolean;
    disabledTypes: NotificationType[];
}
export interface UpdateNotificationSettingsRequestDto {
    muted?: boolean;
    disabledTypes?: NotificationType[];
}
export interface RegisterDeviceTokenRequestDto {
    token: string;
    platform?: 'web' | 'ios' | 'android';
}
export interface MarkNotificationReadRequestDto {
    notificationId: string;
}
//# sourceMappingURL=notification.dto.d.ts.map