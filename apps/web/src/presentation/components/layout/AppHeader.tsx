import { BrandMark } from '@/presentation/components/brand/BrandMark';
import { BackButton } from '@/presentation/components/layout/BackButton';
import { NotificationBell } from '@/presentation/components/layout/NotificationBell';

export function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <BackButton />
        <BrandMark />
        <span className="app-header__spacer" />
        <NotificationBell />
      </div>
    </header>
  );
}
