import type { NotificationDto, NotificationType } from '@bitemate/shared';

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  POST_LIKE: '❤️',
  POST_COMMENT: '💬',
  POST_TAG: '🍴',
  MESSAGE_RECEIVED: '✉️',
  MEETUP_INVITATION: '🍽️',
  MEETUP_ACCEPTED: '🥂',
  MATCH_FOUND: '🧭',
  NEW_FOLLOWER: '👤',
  PAYMENT_RECEIVED: '💰',
  RANKING_UPDATE: '🏆',
};

export function notificationHref(notification: NotificationDto): string | null {
  const data = notification.data ?? {};
  if (notification.type === 'MESSAGE_RECEIVED' && typeof data.chatId === 'string') {
    return `/chats/${data.chatId}`;
  }
  if (notification.type === 'MEETUP_INVITATION' || notification.type === 'MEETUP_ACCEPTED') {
    return '/meetups';
  }
  if (notification.type === 'PAYMENT_RECEIVED') {
    return '/wallet';
  }
  if (notification.type === 'RANKING_UPDATE') {
    return '/rankings';
  }
  if (notification.type === 'NEW_FOLLOWER' && typeof data.username === 'string') {
    return `/u/${data.username}`;
  }
  if (
    notification.type === 'POST_LIKE' ||
    notification.type === 'POST_COMMENT' ||
    notification.type === 'POST_TAG' ||
    notification.type === 'MATCH_FOUND'
  ) {
    return '/feed';
  }
  return '/notifications';
}
