import { Link } from 'react-router-dom';
import { BrandLockup } from '@/presentation/components/brand/BrandLockup';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';

const FEATURE_KEYS = [
  ['landing.features.discover.title', 'landing.features.discover.desc', 'discover'],
  ['landing.features.match.title', 'landing.features.match.desc', 'match'],
  ['landing.features.meetups.title', 'landing.features.meetups.desc', 'meetups'],
  ['landing.features.chat.title', 'landing.features.chat.desc', 'chat'],
  ['landing.features.market.title', 'landing.features.market.desc', 'market'],
  ['landing.features.wallet.title', 'landing.features.wallet.desc', 'wallet'],
] as const;

const HOW_KEYS = [
  ['landing.how.step1.title', 'landing.how.step1.desc'],
  ['landing.how.step2.title', 'landing.how.step2.desc'],
  ['landing.how.step3.title', 'landing.how.step3.desc'],
] as const;

const GALLERY_IMAGES = [
  { src: '/brand/landing-portrait-mixed.jpg', alt: 'Friends dining together' },
  { src: '/brand/landing-portrait-women.jpg', alt: 'Women sharing a meal' },
  { src: '/brand/landing-gallery-couples.jpg', alt: 'Couples at a restaurant' },
  { src: '/brand/landing-gallery-streetfood.jpg', alt: 'Street food meetup' },
  { src: '/brand/landing-portrait-men.jpg', alt: 'Friends at dinner' },
  { src: '/brand/landing-hero-dining.jpg', alt: 'Social dining experience' },
] as const;

function FeatureIcon({ kind }: { kind: (typeof FEATURE_KEYS)[number][2] }) {
  const common = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, 'aria-hidden': true as const };

  switch (kind) {
    case 'discover':
      return (
        <svg {...common}>
          <circle cx="12" cy="10" r="3" />
          <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
        </svg>
      );
    case 'match':
      return (
        <svg {...common}>
          <path d="M12 21s-6-4.35-6-10a4 4 0 0 1 7.2-2.4A4 4 0 0 1 18 11c0 5.65-6 10-6 10z" />
        </svg>
      );
    case 'meetups':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18M8 15h4" />
        </svg>
      );
    case 'chat':
      return (
        <svg {...common}>
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      );
    case 'market':
      return (
        <svg {...common}>
          <path d="M3 9l9-6 9 6v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z" />
          <path d="M9 21V12h6v9" />
        </svg>
      );
    case 'wallet':
      return (
        <svg {...common}>
          <rect x="2" y="6" width="20" height="14" rx="2" />
          <path d="M2 10h20M16 14h.01" />
        </svg>
      );
    default:
      return null;
  }
}

export function LandingPage() {
  const { t } = useI18n();
  const { isAuthenticated, isOtpVerified } = useAuth();
  const inApp = isAuthenticated && isOtpVerified;

  return (
    <main className="landing-page">
      <section className="landing-hero" aria-labelledby="landing-hero-title">
        <div className="landing-hero__glow" aria-hidden />
        <div className="landing-hero__inner">
          <div className="landing-hero__copy">
            <BrandLockup size="lg" />
            <h1 id="landing-hero-title" className="landing-hero__title">
              {t('landing.hero.title')}
            </h1>
            <p className="landing-hero__subtitle">{t('landing.hero.subtitle')}</p>
            <div className="landing-hero__actions">
              {inApp ? (
                <Link to="/feed" className="btn-primary landing-btn landing-btn--primary">
                  {t('nav.openApp')}
                </Link>
              ) : (
                <>
                  <Link to="/register" state={{ authIntro: true }} className="btn-primary landing-btn landing-btn--primary">
                    {t('landing.hero.cta.primary')}
                  </Link>
                  <Link to="/about" className="landing-btn landing-btn--ghost">
                    {t('landing.hero.cta.secondary')}
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="landing-hero__visual" aria-hidden>
            <div className="landing-hero__phones">
              <div className="landing-phone landing-phone--back">
                <div className="landing-phone__screen landing-phone__screen--map" />
              </div>
              <div className="landing-phone landing-phone--front">
                <div className="landing-phone__screen landing-phone__screen--profile" />
              </div>
            </div>
            <div className="landing-hero__portraits">
              <img className="landing-hero__portrait landing-hero__portrait--a" src="/brand/landing-portrait-mixed.jpg" alt="" loading="lazy" />
              <img className="landing-hero__portrait landing-hero__portrait--b" src="/brand/landing-portrait-women.jpg" alt="" loading="lazy" />
              <img className="landing-hero__portrait landing-hero__portrait--c" src="/brand/landing-portrait-men.jpg" alt="" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="landing-strip" aria-labelledby="landing-features-title">
        <div className="landing-strip__inner">
          <h2 id="landing-features-title" className="landing-section-title landing-section-title--center">
            {t('landing.features.title')}
          </h2>
          <div className="landing-strip__grid">
            {FEATURE_KEYS.map(([titleKey, descKey, kind]) => (
              <article key={titleKey} className="landing-strip__item">
                <span className="landing-strip__icon">
                  <FeatureIcon kind={kind} />
                </span>
                <h3>{t(titleKey)}</h3>
                <p>{t(descKey)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-how" aria-labelledby="landing-how-title">
        <div className="landing-how__inner">
          <h2 id="landing-how-title" className="landing-section-title landing-section-title--center">
            {t('landing.how.title')}
          </h2>
          <ol className="landing-how__steps">
            {HOW_KEYS.map(([titleKey, descKey], index) => (
              <li key={titleKey} className="landing-how__step">
                <span className="landing-how__num">{index + 1}</span>
                <div className="landing-how__card">
                  <h3>{t(titleKey)}</h3>
                  <p>{t(descKey)}</p>
                </div>
                {index < HOW_KEYS.length - 1 ? <span className="landing-how__arrow" aria-hidden /> : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="landing-features" aria-label={t('landing.features.title')}>
        <div className="landing-features__inner">
          <div className="landing-features__grid">
            {FEATURE_KEYS.map(([titleKey, descKey, kind]) => (
              <article key={`detail-${titleKey}`} className="landing-feature-card">
                <span className="landing-feature-card__icon">
                  <FeatureIcon kind={kind} />
                </span>
                <h3>{t(titleKey)}</h3>
                <p>{t(descKey)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-gallery" aria-labelledby="landing-gallery-title">
        <div className="landing-gallery__inner">
          <h2 id="landing-gallery-title" className="landing-section-title landing-section-title--center landing-section-title--light">
            {t('landing.footer.tagline')}
          </h2>
          <div className="landing-gallery__track">
            {GALLERY_IMAGES.map((image) => (
              <figure key={image.src} className="landing-gallery__item">
                <img src={image.src} alt={image.alt} loading="lazy" />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-stats-band" aria-label="Stats">
        <div className="landing-stats-band__inner">
          <div className="landing-stats-row">
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
        </div>
      </section>

      <section className="landing-cta" aria-labelledby="landing-cta-title">
        <div className="landing-cta__inner">
          <p className="landing-cta__lead">{t('landing.cta.subtitle')}</p>
          <h2 id="landing-cta-title" className="landing-cta__title">
            {t('landing.cta.title')}
          </h2>
          {!inApp ? (
            <div className="landing-hero__actions">
              <Link to="/register" state={{ authIntro: true }} className="btn-primary landing-btn landing-btn--primary">
                {t('nav.signup')}
              </Link>
              <Link to="/login" state={{ authIntro: true }} className="landing-btn landing-btn--outline">
                {t('nav.login')}
              </Link>
            </div>
          ) : (
            <Link to="/feed" className="btn-primary landing-btn landing-btn--primary">
              {t('nav.openApp')}
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
