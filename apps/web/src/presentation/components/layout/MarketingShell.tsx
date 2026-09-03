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
    <footer className={`marketing-footer${isLanding ? ' marketing-footer--landing' : ''}`}>
        <>
          <div className="marketing-footer__top">
            <div className="marketing-footer__brand">
              <div className="marketing-footer__lockup">
                <BrandMark size="sm" linked={false} />
                <span className="marketing-nav__word">BiteMate</span>
              </div>
              <p className="marketing-footer__tagline">{t('landing.footer.tagline')}</p>
              <div className="marketing-footer__social" aria-label="Social">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" /></svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1z" /></svg>
                </a>
                <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 3h3.1l-6.8 7.8L22 21h-6.2l-4.8-6.3L5.5 21H2.4l7.3-8.3L2 3h6.3l4.4 5.8L17.5 3zm-1.1 16.2h1.7L7.7 4.7H5.9l10.5 14.5z" /></svg>
                </a>
                <a href="https://www.tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.5 3c.4 2.6 2.1 4.4 4.6 4.7v3.1c-1.6 0-3.1-.5-4.4-1.4v6.7c0 3.4-2.7 6.1-6.2 6.1S2.3 19.5 2.3 16.1c0-3.3 2.6-6 5.9-6.1v3.2c-1.5.1-2.7 1.4-2.7 2.9 0 1.6 1.3 2.9 2.9 2.9s2.9-1.3 2.9-2.9V3h3.2z" /></svg>
                </a>
              </div>
            </div>
            <div className="marketing-footer__col">
              <strong>{t('landing.footer.company')}</strong>
              <Link to="/about">{t('nav.about')}</Link>
              <Link to="/careers">{t('landing.footer.careers')}</Link>
              <Link to="/press">{t('landing.footer.press')}</Link>
              <Link to="/contact">{t('landing.footer.contact')}</Link>
            </div>
            <div className="marketing-footer__col">
              <strong>{t('landing.footer.support')}</strong>
              <Link to="/help">{t('landing.footer.help')}</Link>
              <Link to="/safety">{t('landing.footer.safety')}</Link>
              <Link to="/guidelines">{t('landing.footer.guidelines')}</Link>
              <Link to="/privacy">{t('landing.footer.privacy')}</Link>
            </div>
            <div className="marketing-footer__col">
              <strong>{t('landing.footer.businesses')}</strong>
              <Link to="/partners">{t('landing.footer.partner')}</Link>
              <Link to="/restaurant-partners">{t('landing.footer.restaurants')}</Link>
              <Link to="/advertise">{t('landing.footer.advertise')}</Link>
            </div>
            <div className="marketing-footer__col">
              <strong>{t('landing.footer.legal')}</strong>
              <Link to="/terms">{t('landing.footer.terms')}</Link>
              <Link to="/privacy">{t('landing.footer.privacy')}</Link>
              <Link to="/cookies">{t('landing.footer.cookies')}</Link>
            </div>
          </div>
          <div className="marketing-footer__bar">
            <p className="marketing-footer__rights">{t('landing.footer.rights', { year: new Date().getFullYear() })}</p>
            <div className="marketing-footer__bar-end">
              <div className="marketing-footer__stores">
                <a className="store-badge" href="#coming-soon">
                  <span className="store-badge__btn">
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M16.4 12.3c0-3.1 2.5-4.6 2.6-4.7-1.5-2.1-3.7-2.4-4.5-2.4-1.9-.2-3.7 1.1-4.6 1.1-.9 0-2.4-1.1-4-1-2 .1-3.9 1.2-5 3-2.1 3.7-.5 9.1 1.5 12.1 1 1.5 2.2 3.1 3.7 3.1 1.5 0 2-.9 3.8-.9s2.2.9 3.8.9c1.6 0 2.6-1.5 3.6-3 .9-1.4 1.3-2.7 1.3-2.8-.1 0-2.5-1-2.5-4.6zM13.9 3.8c.8-1 1.4-2.4 1.2-3.8-1.2.1-2.6.8-3.4 1.8-.8.9-1.5 2.3-1.3 3.7 1.4.1 2.7-.7 3.5-1.7z" /></svg>
                    <span>
                      <small>Download on the</small>
                      App Store
                    </span>
                  </span>
                  <em>{t('landing.footer.comingSoon')}</em>
                </a>
                <a className="store-badge" href="#coming-soon">
                  <span className="store-badge__btn">
                    <svg viewBox="0 0 24 24" aria-hidden>
                      <path fill="#34A853" d="M3.6 21.4 13.2 12 3.6 2.6C3.2 3 3 3.6 3 4.2v15.6c0 .6.2 1.2.6 1.6z" />
                      <path fill="#FBBC04" d="M16.7 8.5 13.2 12l3.5 3.5 4.2-2.4c.8-.5.8-1.7 0-2.2l-4.2-2.4z" />
                      <path fill="#EA4335" d="M3.6 2.6 13.2 12l3.5-3.5L5.7 1.4C4.9.9 3.8 1.5 3.6 2.6z" />
                      <path fill="#4285F4" d="M13.2 12 3.6 21.4c.2 1.1 1.3 1.7 2.1 1.2l11-6.1L13.2 12z" />
                    </svg>
                    <span>
                      <small>GET IT ON</small>
                      Google Play
                    </span>
                  </span>
                  <em>{t('landing.footer.comingSoon')}</em>
                </a>
              </div>
            </div>
          </div>
        </>
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
