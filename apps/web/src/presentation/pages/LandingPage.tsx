import { Link } from 'react-router-dom';
import { BrandLockup } from '@/presentation/components/brand/BrandLockup';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';

const FEATURE_KEYS = [
  ['landing.features.discover.title', 'landing.features.discover.desc'],
  ['landing.features.match.title', 'landing.features.match.desc'],
  ['landing.features.meetups.title', 'landing.features.meetups.desc'],
  ['landing.features.chat.title', 'landing.features.chat.desc'],
  ['landing.features.market.title', 'landing.features.market.desc'],
  ['landing.features.wallet.title', 'landing.features.wallet.desc'],
] as const;

const HOW_KEYS = [
  ['landing.how.step1.title', 'landing.how.step1.desc'],
  ['landing.how.step2.title', 'landing.how.step2.desc'],
  ['landing.how.step3.title', 'landing.how.step3.desc'],
] as const;

export function LandingPage() {
  const { t } = useI18n();
  const { isAuthenticated, isOtpVerified } = useAuth();
  const inApp = isAuthenticated && isOtpVerified;

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero__glow" aria-hidden />
        <div className="landing-hero__inner">
          <BrandLockup size="xl" />
          <h1>{t('landing.hero.title')}</h1>
          <p className="landing-hero__subtitle">{t('landing.hero.subtitle')}</p>
          <div className="landing-hero__actions">
            {inApp ? (
              <Link to="/feed" className="btn-primary landing-btn">
                {t('nav.openApp')}
              </Link>
            ) : (
              <>
                <Link to="/register" state={{ authIntro: true }} className="btn-primary landing-btn">
                  {t('landing.hero.cta.primary')}
                </Link>
                <Link to="/about" className="landing-btn landing-btn--ghost">
                  {t('landing.hero.cta.secondary')}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="landing-stats" aria-label="Stats">
        <article>
          <strong>120K+</strong>
          <span>{t('landing.stats.users')}</span>
        </article>
        <article>
          <strong>80+</strong>
          <span>{t('landing.stats.cities')}</span>
        </article>
        <article>
          <strong>24/7</strong>
          <span>{t('landing.stats.meetups')}</span>
        </article>
      </section>

      <section className="landing-section">
        <h2>{t('landing.features.title')}</h2>
        <div className="landing-grid">
          {FEATURE_KEYS.map(([titleKey, descKey], index) => (
            <article key={titleKey} className="landing-card">
              <span className="landing-card__index">{index + 1}</span>
              <h3>{t(titleKey)}</h3>
              <p>{t(descKey)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-section--soft">
        <h2>{t('landing.how.title')}</h2>
        <ol className="landing-steps">
          {HOW_KEYS.map(([titleKey, descKey], index) => (
            <li key={titleKey}>
              <span className="landing-steps__num">{index + 1}</span>
              <div>
                <h3>{t(titleKey)}</h3>
                <p>{t(descKey)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing-cta">
        <h2>{t('landing.cta.title')}</h2>
        <p>{t('landing.cta.subtitle')}</p>
        {!inApp ? (
          <div className="landing-hero__actions">
            <Link to="/register" state={{ authIntro: true }} className="btn-primary landing-btn">
              {t('nav.signup')}
            </Link>
            <Link to="/login" state={{ authIntro: true }} className="landing-btn landing-btn--ghost">
              {t('nav.login')}
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
