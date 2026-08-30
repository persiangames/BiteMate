import { useLocation } from 'react-router-dom';
import { BrandMark } from '@/presentation/components/brand/BrandMark';
import { LanguageSwitcher } from '@/presentation/components/LanguageSwitcher';
import { BackButton } from '@/presentation/components/layout/BackButton';
import { NotificationBell } from '@/presentation/components/layout/NotificationBell';
import { SettingsButton } from '@/presentation/components/layout/SettingsButton';
import { isMainTabRoute } from '@/presentation/utils/pageTitles';

export function AppHeader() {
  const { pathname } = useLocation();
  const showBack = !isMainTabRoute(pathname);

  return (
    <header className="app-header">
      <div className="app-header__inner app-header__inner--logo">
        <div className="app-header__start">
          {showBack ? <BackButton /> : null}
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
