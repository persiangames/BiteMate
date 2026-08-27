import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BiteMateLogoIntro } from '@/presentation/components/brand/BiteMateLogoIntro';

const INTRO_ROUTES = new Set(['/login', '/register']);

export function AuthEntryLayout() {
  const { pathname } = useLocation();
  const isIntroRoute = INTRO_ROUTES.has(pathname);
  const [showIntro, setShowIntro] = useState(false);
  const lastPlayedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!isIntroRoute) {
      setShowIntro(false);
      lastPlayedPath.current = null;
      return;
    }
    if (lastPlayedPath.current === pathname) {
      return;
    }
    lastPlayedPath.current = pathname;
    setShowIntro(true);
  }, [isIntroRoute, pathname]);

  return (
    <>
      <Outlet />
      {showIntro && isIntroRoute ? (
        <BiteMateLogoIntro onComplete={() => setShowIntro(false)} />
      ) : null}
    </>
  );
}
