import { Outlet, useLocation } from 'react-router-dom';
import { BackButton } from '@/presentation/components/layout/BackButton';
import { BrandMark } from '@/presentation/components/brand/BrandMark';

export function PublicShell() {
  const { pathname } = useLocation();
  const isLoginPage = pathname === '/login';

  return (
    <>
      {!isLoginPage ? (
        <header className="app-header">
          <div className="app-header__inner">
            <BackButton />
            <BrandMark />
          </div>
        </header>
      ) : null}
      <Outlet />
    </>
  );
}
