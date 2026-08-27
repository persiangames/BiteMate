import { BrandMark } from '@/presentation/components/brand/BrandMark';
import { LanguageSwitcher } from '@/presentation/components/LanguageSwitcher';
import { BackButton } from '@/presentation/components/layout/BackButton';
import { NotificationBell } from '@/presentation/components/layout/NotificationBell';
import { SettingsButton } from '@/presentation/components/layout/SettingsButton';

export function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <BackButton />
        <BrandMark />
        <span className="app-header__spacer" />
        <div className="app-header__actions">
          <LanguageSwitcher placement="header" />
          <NotificationBell />
          <SettingsButton />
        </div>
      </div>
    </header>
  );
}
