import { Link } from 'react-router-dom';
import { NOTIFICATION_TYPES, type NotificationType } from '@bitemate/shared';
import { useEffect, useState } from 'react';
import {
  fetchNotificationSettings,
  updateNotificationSettings,
} from '@/data/repositories/notificationRepository';
import { useNotifications } from '@/presentation/context/NotificationContext';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';
import { SaveFeedback } from '@/presentation/components/SaveFeedback';
import { NOTIFICATION_ICONS, notificationHref } from '@/presentation/utils/notificationUi';

export function NotificationsPage() {
  const { accessToken } = useAuth();
  const { t } = useI18n();
  const { items, unreadCount, markRead, markAllRead, refresh } = useNotifications();
  const [muted, setMuted] = useState(false);
  const [disabledTypes, setDisabledTypes] = useState<NotificationType[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    fetchNotificationSettings(accessToken)
      .then((settings) => {
        setMuted(settings.muted);
        setDisabledTypes(settings.disabledTypes);
      })
      .catch(() => undefined);
  }, [accessToken]);

  async function saveSettings(nextMuted: boolean, nextDisabled: NotificationType[]) {
    if (!accessToken) return;
    const settings = await updateNotificationSettings(accessToken, {
      muted: nextMuted,
      disabledTypes: nextDisabled,
    });
    setMuted(settings.muted);
    setDisabledTypes(settings.disabledTypes);
    setMessage('ok');
  }

  function toggleType(type: NotificationType) {
    const next = disabledTypes.includes(type)
      ? disabledTypes.filter((item) => item !== type)
      : [...disabledTypes, type];
    setDisabledTypes(next);
    void saveSettings(muted, next);
  }

  return (
    <div className="app-screen">
      <header className="screen-header">
        <h1>{t('notifications.title')}</h1>
        {unreadCount > 0 && (
          <button type="button" className="btn-secondary" onClick={() => void markAllRead()}>
            {t('notifications.markAll')}
          </button>
        )}
      </header>

      <section className="glass-card flow">
        <h2>{t('notifications.prefs')}</h2>
        <label className="field inline">
          <input
            type="checkbox"
            checked={muted}
            onChange={(event) => {
              setMuted(event.target.checked);
              void saveSettings(event.target.checked, disabledTypes);
            }}
          />
          <span>{t('notifications.mute')}</span>
        </label>
        <div className="filter-row">
          {NOTIFICATION_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className={`filter-chip${disabledTypes.includes(type) ? '' : ' active'}`}
              onClick={() => toggleType(type)}
            >
              {NOTIFICATION_ICONS[type]} {disabledTypes.includes(type) ? t('notifications.off') : t('notifications.on')} · {t(`notifications.${type}`)}
            </button>
          ))}
        </div>
      </section>

      <div className="card-list">
        {items.map((notification) => (
          <article
            key={notification.id}
            className={`glass-card${notification.readAt ? '' : ' glass-card--lg'}`}
            onClick={() => {
              if (!notification.readAt) {
                void markRead(notification.id);
              }
            }}
            onKeyDown={() => undefined}
            role="button"
            tabIndex={0}
          >
            <div className="chat-list-header">
              <strong>
                <span className="notify-type-icon" aria-hidden>
                  {NOTIFICATION_ICONS[notification.type]}
                </span>{' '}
                {notification.title}
              </strong>
              {!notification.readAt && <span className="online-dot" />}
            </div>
            <p>{notification.body}</p>
            <p className="hint">
              {new Date(notification.createdAt).toLocaleString()} · {t(`notifications.${notification.type}`)}
            </p>
            {notificationHref(notification) ? (
              <Link to={notificationHref(notification)!} className="btn-secondary">
                {t('notifications.open')}
              </Link>
            ) : null}
          </article>
        ))}
      </div>

      {!items.length && <p className="hint">{t('notifications.empty')}</p>}
      <SaveFeedback saved={Boolean(message)} error={null} successKey="notifications.saved" />
      <button type="button" className="btn-ghost" onClick={() => void refresh()}>
        {t('common.refresh')}
      </button>
    </div>
  );
}
