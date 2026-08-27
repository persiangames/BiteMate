import { Outlet, useLocation } from 'react-router-dom';
import { BackButton } from '@/presentation/components/layout/BackButton';
import { BrandMark } from '@/presentation/components/brand/BrandMark';
import { AppPageBackdrop } from '@/presentation/components/layout/AppPageBackdrop';

export function PublicShell() {
  return (
    <AppPageBackdrop>
      <header className="app-header">
        <div className="app-header__inner">
          <BackButton />
          <BrandMark />
        </div>
      </header>
      <Outlet />
    </AppPageBackdrop>
  );
}
