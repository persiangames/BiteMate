import type {
  NotificationDto,
  NotificationSettingsDto,
  NotificationsListResponseDto,
  RegisterDeviceTokenRequestDto,
  UpdateNotificationSettingsRequestDto,
} from '@bitemate/shared';
import { apiFetch, authHeaders } from '@/data/api/client';

export async function fetchNotifications(
  accessToken: string,
  cursor?: string,
): Promise<NotificationsListResponseDto> {
  const search = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return apiFetch<NotificationsListResponseDto>(`/notifications${search}`, {
    headers: authHeaders(accessToken),
  });
}

export async function fetchNotificationSettings(
  accessToken: string,
): Promise<NotificationSettingsDto> {
  return apiFetch<NotificationSettingsDto>('/notifications/settings', {
    headers: authHeaders(accessToken),
  });
}

export async function updateNotificationSettings(
  accessToken: string,
  payload: UpdateNotificationSettingsRequestDto,
): Promise<NotificationSettingsDto> {
  return apiFetch<NotificationSettingsDto>('/notifications/settings', {
    method: 'PUT',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function markNotificationRead(
  accessToken: string,
  notificationId: string,
): Promise<NotificationDto> {
  return apiFetch<NotificationDto>('/notifications/read', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ notificationId }),
  });
}

export async function markAllNotificationsRead(
  accessToken: string,
): Promise<{ updated: number }> {
  return apiFetch<{ updated: number }>('/notifications/read-all', {
    method: 'POST',
    headers: authHeaders(accessToken),
  });
}

export async function registerDeviceToken(
  accessToken: string,
  payload: RegisterDeviceTokenRequestDto,
): Promise<{ registered: true }> {
  return apiFetch<{ registered: true }>('/notifications/devices', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}
