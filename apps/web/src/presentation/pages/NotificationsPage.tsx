import { Link } from 'react-router-dom';
import { type NotificationDto, type NotificationType } from '@bitemate/shared';
import { useEffect, useMemo, useState } from 'react';
import {
  fetchNotificationSettings,
  updateNotificationSettings,
} from '@/data/repositories/notificationRepository';
import { useNotifications } from '@/presentation/context/NotificationContext';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';
import { SaveFeedback } from '@/presentation/components/SaveFeedback';
import { NOTIFICATION_ICONS, notificationHref } from '@/presentation/utils/notificationUi';
import {
  type NotificationCategory,
  notificationMatchesCategory,
} from '@/presentation/utils/pageTitles';

const CATEGORIES: NotificationCategory[] = ['ALL', 'MESSAGES', 'SOCIAL', 'MEETUPS', 'SYSTEM'];

function dayBucket(iso: string, t: (key: string) => string): string {
  const date = new Date(iso);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startToday.getTime() - startDate.getTime()) / 86_400_000);

  if (diffDays === 0) return t('chat.today');
  if (diffDays === 1) return t('chat.yesterday');
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

function groupByDay(notifications: NotificationDto[], t: (key: string) => string) {
  const groups = new Map<string, NotificationDto[]>();
  for (const item of notifications) {
    const key = dayBucket(item.createdAt, t);
    const bucket = groups.get(key) ?? [];
    bucket.push(item);
    groups.set(key, bucket);
  }
  return Array.from(groups.entries());
}

export function NotificationsPage() {
  const { accessToken } = useAuth();
  const { t } = useI18n();
  const { items, unreadCount, markRead, markAllRead, refresh } = useNotifications();
  const [category, setCategory] = useState<NotificationCategory>('ALL');
  const [settingsOpen, setSettingsOpen] = useState(false);
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

  const filtered = useMemo(
    () => items.filter((item) => notificationMatchesCategory(item.type, category)),
    [items, category],
  );

  const unreadByCategory = useMemo(() => {
    const counts: Record<NotificationCategory, number> = {
      ALL: 0,
      MESSAGES: 0,
      SOCIAL: 0,
      MEETUPS: 0,
      SYSTEM: 0,
    };

    for (const item of items) {
      if (item.readAt) continue;
      counts.ALL += 1;
      for (const key of CATEGORIES) {
        if (key !== 'ALL' && notificationMatchesCategory(item.type, key)) {
          counts[key] += 1;
        }
      }
    }

    return counts;
  }, [items]);

  const grouped = useMemo(() => groupByDay(filtered, t), [filtered, t]);

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
    <div className="app-screen notifications-page">
      <header className="screen-header screen-header--actions">
        {unreadCount > 0 ? (
          <button type="button" className="btn-secondary btn-compact" onClick={() => void markAllRead()}>
            {t('notifications.markAll')}
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          className="btn-ghost btn-compact"
          aria-expanded={settingsOpen}
          onClick={() => setSettingsOpen((open) => !open)}
        >
          {t('notifications.prefs')}
        </button>
      </header>

      <div className="notify-tabs" role="tablist" aria-label={t('notifications.categories')}>
        {CATEGORIES.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={category === tab}
            className={`notify-tabs__item${category === tab ? ' active' : ''}`}
            onClick={() => setCategory(tab)}
          >
            <span>{t(`notifications.category.${tab}`)}</span>
            {unreadByCategory[tab] > 0 ? (
              <span className="notify-tabs__badge">{unreadByCategory[tab]}</span>
            ) : null}
          </button>
        ))}
      </div>

      {settingsOpen ? (
        <section className="glass-card flow notify-settings">
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
          <p className="hint">{t('notifications.typePrefs')}</p>
          <div className="notify-type-grid">
            {(['MESSAGE_RECEIVED', 'POST_LIKE', 'POST_COMMENT', 'NEW_FOLLOWER', 'MEETUP_INVITATION', 'MEETUP_ACCEPTED', 'MATCH_FOUND', 'PAYMENT_RECEIVED', 'RANKING_UPDATE', 'POST_TAG'] as NotificationType[]).map((type) => (
              <button
                key={type}
                type="button"
                className={`notify-type-chip${disabledTypes.includes(type) ? ' is-off' : ''}`}
                onClick={() => toggleType(type)}
              >
                <span aria-hidden>{NOTIFICATION_ICONS[type]}</span>
                <span>{t(`notifications.${type}`)}</span>
                <span className="notify-type-chip__state">
                  {disabledTypes.includes(type) ? t('notifications.off') : t('notifications.on')}
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="notify-feed">
        {grouped.map(([day, dayItems]) => (
          <section key={day} className="notify-day">
            <h2 className="notify-day__title">{day}</h2>
            <div className="notify-list">
              {dayItems.map((notification) => {
                const href = notificationHref(notification);
                return (
                  <article
                    key={notification.id}
                    className={`notify-item${notification.readAt ? '' : ' notify-item--unread'}`}
                    onClick={() => {
                      if (!notification.readAt) {
                        void markRead(notification.id);
                      }
                    }}
                    onKeyDown={() => undefined}
                    role="button"
                    tabIndex={0}
                  >
                    <span className="notify-item__icon" aria-hidden>
                      {NOTIFICATION_ICONS[notification.type]}
                    </span>
                    <div className="notify-item__body">
                      <div className="notify-item__head">
                        <strong>{notification.title}</strong>
                        <time className="notify-item__time">
                          {new Date(notification.createdAt).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </time>
                      </div>
                      <p>{notification.body}</p>
                      <span className="notify-item__type">{t(`notifications.${notification.type}`)}</span>
                      {href ? (
                        <Link
                          to={href}
                          className="notify-item__link"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {t('notifications.open')}
                        </Link>
                      ) : null}
                    </div>
                    {!notification.readAt ? <span className="notify-item__dot" aria-hidden /> : null}
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {!filtered.length ? <p className="hint notify-empty">{t('notifications.emptyCategory')}</p> : null}

      <SaveFeedback saved={Boolean(message)} error={null} successKey="notifications.saved" />
      <button type="button" className="btn-ghost btn-compact" onClick={() => void refresh()}>
        {t('common.refresh')}
      </button>
    </div>
  );
}
