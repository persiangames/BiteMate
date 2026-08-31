import { useLocation } from 'react-router-dom';
import { BrandMark } from '@/presentation/components/brand/BrandMark';
import { LanguageSwitcher } from '@/presentation/components/LanguageSwitcher';
import { BackButton } from '@/presentation/components/layout/BackButton';
import { NotificationBell } from '@/presentation/components/layout/NotificationBell';
import { SettingsButton } from '@/presentation/components/layout/SettingsButton';
import { useI18n } from '@/presentation/context/I18nContext';
import { isMainTabRoute, resolvePageTitle } from '@/presentation/utils/pageTitles';

export function AppHeader() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const title = resolvePageTitle(pathname, t);
  const showBack = !isMainTabRoute(pathname);

  return (
    <header className="app-header">
      <div className="app-header__inner app-header__inner--logo">
        <div className="app-header__start">
          {showBack ? <BackButton /> : null}
          {title ? <h1 className="app-header__title">{title}</h1> : null}
        </div>
        <div className="app-header__brand">
          <BrandMark size="sm" homeTo="/feed" />
        </div>
        <div className="app-header__actions">
          <LanguageSwitcher placement="header" />
          <NotificationBell />
          <SettingsButton />
        </div>
      </div>
    </header>
  );
}
