import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BiteMateLogoIntro } from '@/presentation/components/brand/BiteMateLogoIntro';

const INTRO_ROUTES = new Set(['/login', '/register']);

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function AuthEntryLayout() {
  const { pathname } = useLocation();
  const isIntroRoute = INTRO_ROUTES.has(pathname);
  const skipIntro = prefersReducedMotion();
  const [showIntro, setShowIntro] = useState(false);
  const [formReady, setFormReady] = useState(skipIntro || !isIntroRoute);
  const lastPlayedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!isIntroRoute) {
      setShowIntro(false);
      setFormReady(true);
      lastPlayedPath.current = null;
      return;
    }
    if (skipIntro) {
      setShowIntro(false);
      setFormReady(true);
      return;
    }
    if (lastPlayedPath.current === pathname) {
      return;
    }
    lastPlayedPath.current = pathname;
    setFormReady(false);
    setShowIntro(true);
  }, [isIntroRoute, pathname, skipIntro]);

  function handleIntroComplete() {
    setShowIntro(false);
    window.setTimeout(() => setFormReady(true), 80);
  }

  return (
    <>
      <div
        className={`auth-entry-shell${showIntro ? ' auth-entry-shell--intro' : ''}${formReady ? ' auth-entry-shell--ready' : ''}`}
      >
        <Outlet />
      </div>
      {showIntro && isIntroRoute ? (
        <BiteMateLogoIntro onComplete={handleIntroComplete} />
      ) : null}
    </>
  );
}
