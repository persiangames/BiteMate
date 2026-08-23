import { Outlet } from 'react-router-dom';
import { BackButton } from '@/presentation/components/layout/BackButton';
import { BrandMark } from '@/presentation/components/brand/BrandMark';

export function PublicShell() {
  return (
    <>
      <header className="app-header">
        <div className="app-header__inner">
          <BackButton />
          <BrandMark />
        </div>
      </header>
      <Outlet />
    </>
  );
}
