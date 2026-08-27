import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AuthIntroSplash } from '@/presentation/components/brand/AuthIntroSplash';

const INTRO_ROUTES = new Set(['/login', '/register']);

export function AuthEntryLayout() {
  const { pathname } = useLocation();
  const isIntroRoute = INTRO_ROUTES.has(pathname);
  const [showContent, setShowContent] = useState(!isIntroRoute);

  useEffect(() => {
    if (!isIntroRoute) {
      setShowContent(true);
      return;
    }
    setShowContent(false);
  }, [isIntroRoute, pathname]);

  if (!showContent && isIntroRoute) {
    return <AuthIntroSplash onDone={() => setShowContent(true)} />;
  }

  return <Outlet />;
}
