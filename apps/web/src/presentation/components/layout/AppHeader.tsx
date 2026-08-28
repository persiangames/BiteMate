import { Link } from 'react-router-dom';
import { BrandMark } from '@/presentation/components/brand/BrandMark';
import { LanguageSwitcher } from '@/presentation/components/LanguageSwitcher';
import { BackButton } from '@/presentation/components/layout/BackButton';
import { NotificationBell } from '@/presentation/components/layout/NotificationBell';
import { SettingsButton } from '@/presentation/components/layout/SettingsButton';
import { useI18n } from '@/presentation/context/I18nContext';

export function AppHeader() {
  const { t } = useI18n();

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <BackButton />
        <BrandMark />
        <span className="app-header__spacer" />
        <div className="app-header__actions">
          <Link to="/people" className="app-header__search" aria-label={t('nav.people')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Link>
          <LanguageSwitcher placement="header" />
          <NotificationBell />
          <SettingsButton />
        </div>
      </div>
    </header>
  );
}
