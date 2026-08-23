import { Link } from 'react-router-dom';
import { useI18n } from '@/presentation/context/I18nContext';
import { useNotifications } from '@/presentation/context/NotificationContext';

export function NotificationBell() {
  const { t } = useI18n();
  const { unreadCount } = useNotifications();

  return (
    <Link
      to="/notifications"
      className="notify-bell"
      aria-label={t('notifications.title')}
    >
      <span className="notify-bell__icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
          <path
            d="M7 14.5c0-3.2 1.4-5.2 3.2-6.1V7.6a1.8 1.8 0 1 1 3.6 0v.8c1.8.9 3.2 2.9 3.2 6.1v.2H7v-.2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M6 15.2h12v1.2a2.4 2.4 0 0 1-2.4 2.4h-7.2A2.4 2.4 0 0 1 6 16.4v-1.2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M10 8.2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="4.2" r="1.1" fill="currentColor" />
        </svg>
      </span>
      {unreadCount > 0 ? (
        <span className="notify-bell__badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
      ) : null}
    </Link>
  );
}
