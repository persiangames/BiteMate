import { Link, Outlet, useLocation } from 'react-router-dom';
import { BrandMark } from '@/presentation/components/brand/BrandMark';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';

export function MarketingShell() {
  const { t } = useI18n();
  const { isAuthenticated, isOtpVerified } = useAuth();
  const { pathname } = useLocation();
  const inApp = isAuthenticated && isOtpVerified;
  const isLanding = pathname === '/';

  return (
    <div className={`marketing-shell${isLanding ? ' marketing-shell--landing' : ''}`}>
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
        <div className="marketing-footer__inner">
          <div className="marketing-footer__brand">
            <BrandMark size="sm" linked={false} />
            <p className="marketing-footer__tagline">{t('landing.footer.tagline')}</p>
          </div>
          <div className="marketing-footer__cols">
            <div className="marketing-footer__col">
              <strong>{t('nav.about')}</strong>
              <Link to="/about">{t('nav.about')}</Link>
              <Link to="/faq">{t('nav.faq')}</Link>
            </div>
            <div className="marketing-footer__col">
              <strong>{t('nav.login')}</strong>
              <Link to="/login" state={{ authIntro: true }}>{t('nav.login')}</Link>
              <Link to="/register" state={{ authIntro: true }}>{t('nav.signup')}</Link>
            </div>
            <div className="marketing-footer__col">
              <strong>{t('language.title')}</strong>
              <Link to="/language">{t('language.title')}</Link>
            </div>
          </div>
        </div>
        <p className="marketing-footer__rights">{t('landing.footer.rights', { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  );
}
