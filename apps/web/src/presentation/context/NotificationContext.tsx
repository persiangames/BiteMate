import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { NotificationDto } from '@bitemate/shared';
import { connectRealtime, onNotification } from '@/data/api/socketClient';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/data/repositories/notificationRepository';
import { useAuth } from '@/presentation/context/AuthContext';

interface NotificationContextValue {
  items: NotificationDto[];
  unreadCount: number;
  refresh: () => Promise<void>;
  markRead: (notificationId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { accessToken, isAuthenticated, isOtpVerified } = useAuth();
  const [items, setItems] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!accessToken) return;
    const response = await fetchNotifications(accessToken);
    setItems(response.items);
    setUnreadCount(response.unreadCount);
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken || !isAuthenticated || !isOtpVerified) {
      return;
    }

    connectRealtime(accessToken);
    void refresh();

    const unsubscribe = onNotification((notification) => {
      setItems((current) => {
        if (current.some((item) => item.id === notification.id)) {
          return current.map((item) => (item.id === notification.id ? notification : item));
        }
        return [notification, ...current];
      });
      if (!notification.readAt) {
        setUnreadCount((count) => count + 1);
      }
    });

    return unsubscribe;
  }, [accessToken, isAuthenticated, isOtpVerified, refresh]);

  const markRead = useCallback(
    async (notificationId: string) => {
      if (!accessToken) return;
      let wasUnread = false;
      setItems((current) => {
        const target = current.find((item) => item.id === notificationId);
        wasUnread = Boolean(target && !target.readAt);
        return current;
      });
      if (!wasUnread) return;

      const updated = await markNotificationRead(accessToken, notificationId);
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setUnreadCount((count) => Math.max(0, count - 1));
    },
    [accessToken],
  );

  const markAllRead = useCallback(async () => {
    if (!accessToken) return;
    await markAllNotificationsRead(accessToken);
    setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
    setUnreadCount(0);
  }, [accessToken]);

  const value = useMemo(
    () => ({ items, unreadCount, refresh, markRead, markAllRead }),
    [items, unreadCount, refresh, markRead, markAllRead],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
