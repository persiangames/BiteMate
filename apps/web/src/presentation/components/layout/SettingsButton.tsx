import { Link } from 'react-router-dom';
import { useI18n } from '@/presentation/context/I18nContext';

export function SettingsButton() {
  const { t } = useI18n();

  return (
    <Link to="/settings" className="icon-btn settings-btn" aria-label={t('settings.title')}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
        <path
          d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M19.4 13.6a7.4 7.4 0 0 0 .1-3.2l2-1.2-2-3.5-2.3 1a7.4 7.4 0 0 0-2.8-1.6l-.4-2.4H10l-.4 2.4a7.4 7.4 0 0 0-2.8 1.6l-2.3-1-2 3.5 2 1.2a7.4 7.4 0 0 0 .1 3.2l-2 1.2 2 3.5 2.3-1a7.4 7.4 0 0 0 2.8 1.6l.4 2.4h4.2l.4-2.4a7.4 7.4 0 0 0 2.8-1.6l2.3 1 2-3.5-2-1.2Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
