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
      <section className="landing-scene landing-scene--dining">
        <div className="landing-scene__backdrop" aria-hidden>
          <div className="landing-scene__scrim" />
        </div>
        <div className="landing-scene__content landing-scene__content--hero">
          <div className="landing-copy-panel landing-copy-panel--hero">
            <BrandLockup size="xl" />
            <h1 className="landing-hero-title">{t('landing.hero.title')}</h1>
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
        </div>
      </section>

      <section className="landing-scene landing-scene--home-chef">
        <div className="landing-scene__backdrop" aria-hidden>
          <div className="landing-scene__scrim" />
        </div>
        <div className="landing-scene__content landing-scene__content--stats">
          <div className="landing-copy-panel landing-copy-panel--compact">
          <div className="landing-stats-row" aria-label="Stats">
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
          </div>
          <h2 className="landing-features-headline">{t('landing.features.title')}</h2>
          </div>
        </div>
      </section>

      <section className="landing-scene landing-scene--food-tester">
        <div className="landing-scene__backdrop" aria-hidden>
          <div className="landing-scene__scrim" />
        </div>
        <div className="landing-scene__content">
          <div className="landing-grid">
            {FEATURE_KEYS.map(([titleKey, descKey], index) => (
              <article key={titleKey} className="landing-card landing-card--glass">
                <span className="landing-card__index">{index + 1}</span>
                <h3>{t(titleKey)}</h3>
                <p>{t(descKey)}</p>
              </article>
            ))}
          </div>

          <ol className="landing-steps">
            {HOW_KEYS.map(([titleKey, descKey], index) => (
              <li key={titleKey} className="landing-steps__item landing-card--glass">
                <span className="landing-steps__num">{index + 1}</span>
                <div>
                  <h3>{t(titleKey)}</h3>
                  <p>{t(descKey)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="landing-scene landing-scene--map">
        <div className="landing-scene__backdrop" aria-hidden>
          <div className="landing-scene__scrim" />
        </div>
        <div className="landing-scene__content landing-scene__content--cta">
          <div className="landing-copy-panel">
          <h2>{t('landing.how.title')}</h2>
          <p className="landing-cta__lead">{t('landing.cta.subtitle')}</p>
          <h3 className="landing-cta__title">{t('landing.cta.title')}</h3>
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
          </div>
        </div>
      </section>
    </main>
  );
}
