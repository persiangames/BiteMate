import { Link, Outlet, useLocation } from 'react-router-dom';
import { BrandMark } from '@/presentation/components/brand/BrandMark';
import { LanguageSwitcher } from '@/presentation/components/LanguageSwitcher';
import { LandingTabletFrame } from '@/presentation/components/layout/LandingTabletFrame';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';

export function MarketingShell() {
  const { t } = useI18n();
  const { isAuthenticated, isOtpVerified } = useAuth();
  const { pathname } = useLocation();
  const inApp = isAuthenticated && isOtpVerified;
  const isLanding = pathname === '/';

  const header = (
    <header className="marketing-nav">
      <div className="marketing-nav__inner">
        <Link to="/" className="marketing-nav__brand" aria-label="BiteMate">
          <BrandMark size="md" linked={false} />
          <span className="marketing-nav__word">BiteMate</span>
        </Link>
        <nav className="marketing-nav__links" aria-label="Site">
          {isLanding ? (
            <a href="#how-it-works">{t('landing.how.title')}</a>
          ) : null}
          <Link to="/about" className={pathname === '/about' ? 'is-active' : ''}>
            {t('nav.about')}
          </Link>
          <Link to="/faq" className={pathname === '/faq' ? 'is-active' : ''}>
            {t('nav.faq')}
          </Link>
          <LanguageSwitcher placement="marketing" />
          {inApp ? (
            <Link to="/feed" className="marketing-nav__cta marketing-nav__cta--ghost">
              {t('nav.openApp')}
            </Link>
          ) : (
            <>
              <Link to="/login" state={{ authIntro: true }} className="marketing-nav__cta marketing-nav__cta--ghost">
                {t('nav.login')}
              </Link>
              <Link to="/register" state={{ authIntro: true }} className="marketing-nav__cta marketing-nav__cta--primary">
                {t('nav.signup')}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );

  const footer = (
    <footer className="marketing-footer">
      <div className="marketing-footer__inner">
        <div className="marketing-footer__brand">
          <BrandMark size="sm" linked={false} />
          <p className="marketing-footer__tagline">{t('landing.footer.tagline')}</p>
        </div>
        <div className="marketing-footer__cols">
          <div className="marketing-footer__col">
            <Link to="/about">{t('nav.about')}</Link>
            <Link to="/faq">{t('nav.faq')}</Link>
          </div>
        </div>
      </div>
      <p className="marketing-footer__rights">{t('landing.footer.rights', { year: new Date().getFullYear() })}</p>
    </footer>
  );

  return (
    <div className={`marketing-shell${isLanding ? ' marketing-shell--landing' : ''}`}>
      {isLanding ? (
        <LandingTabletFrame>
          {header}
          <Outlet />
          {footer}
        </LandingTabletFrame>
      ) : (
        <>
          {header}
          <Outlet />
          {footer}
        </>
      )}
    </div>
  );
}
