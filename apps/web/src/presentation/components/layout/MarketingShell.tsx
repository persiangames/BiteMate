import { Link, Outlet, useLocation } from 'react-router-dom';
import { BrandMark } from '@/presentation/components/brand/BrandMark';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';

export function MarketingShell() {
  const { t } = useI18n();
  const { isAuthenticated, isOtpVerified } = useAuth();
  const { pathname } = useLocation();
  const inApp = isAuthenticated && isOtpVerified;

  return (
    <div className="marketing-shell">
      <header className="marketing-nav">
        <div className="marketing-nav__inner">
          <Link to="/" className="marketing-nav__brand" aria-label="BiteMate">
            <BrandMark size="md" linked={false} />
            <span className="marketing-nav__word">BiteMate</span>
          </Link>
          <nav className="marketing-nav__links" aria-label="Site">
            <Link to="/about" className={pathname === '/about' ? 'is-active' : ''}>
              {t('nav.about')}
            </Link>
            <Link to="/faq" className={pathname === '/faq' ? 'is-active' : ''}>
              {t('nav.faq')}
            </Link>
            <Link to="/language">{t('language.title')}</Link>
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
      <Outlet />
      <footer className="marketing-footer">
        <p>{t('landing.footer.tagline')}</p>
        <p>{t('landing.footer.rights', { year: new Date().getFullYear() })}</p>
        <div className="marketing-footer__links">
          <Link to="/about">{t('nav.about')}</Link>
          <Link to="/faq">{t('nav.faq')}</Link>
          <Link to="/language">{t('language.title')}</Link>
        </div>
      </footer>
    </div>
  );
}
