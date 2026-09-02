import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ICON_MARK_VERSION } from '@/presentation/components/brand/icon-mark.version';
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
  ['landing.how.step1.title', 'landing.how.step1.desc', 'landing-how-card-1.png'],
  ['landing.how.step2.title', 'landing.how.step2.desc', 'landing-how-card-2.png'],
  ['landing.how.step3.title', 'landing.how.step3.desc', 'landing-how-card-3.png'],
  ['landing.how.step4.title', 'landing.how.step4.desc', 'landing-how-card-4.png'],
  ['landing.how.step5.title', 'landing.how.step5.desc', 'landing-how-card-5.png'],
] as const;

const GALLERY_IMAGES = [
  { src: '/brand/landing-slide-01.jpg', alt: 'Friends dining together' },
  { src: '/brand/landing-slide-02.jpg', alt: 'Senior friends at a luxury dinner' },
  { src: '/brand/landing-slide-03.jpg', alt: 'Couples at a restaurant' },
  { src: '/brand/landing-slide-04.jpg', alt: 'Street food meetup' },
  { src: '/brand/landing-slide-05.jpg', alt: 'Brunch with friends' },
  { src: '/brand/landing-gallery-streetfood.jpg', alt: 'Street food night' },
  { src: '/brand/landing-gallery-couples.jpg', alt: 'Couples sharing a meal' },
  { src: '/brand/landing-hero-map-discover.jpg', alt: 'Discover people nearby' },
] as const;

function splitHeroTitle(title: string): { lead: string; accent: string } {
  const match = title.match(/^(.+?[.،,—–…]\s*)(.+)$/u);
  if (!match) {
    return { lead: title, accent: '' };
  }
  return { lead: match[1].trimEnd(), accent: match[2].trim() };
}

function LandingHeroTitle({ title }: { title: string }) {
  const { lead, accent } = splitHeroTitle(title);
  return (
    <h1 id="landing-hero-title" className="landing-hero__title">
      {lead ? <span className="landing-hero__title-lead">{lead}</span> : null}
      {accent ? <span className="landing-hero__title-accent">{accent}</span> : null}
    </h1>
  );
}

function LandingHeroVisual() {
  return (
    <figure className="landing-hero__visual-ref" aria-hidden>
      <img
        src="/brand/landing-hero-phones-composite.png?v=4"
        alt=""
        width={1536}
        height={1024}
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
      <div className="landing-hero__match-caption">
        <img
          className="landing-hero__match-caption-logo"
          src={`/brand/icon-mark.png?v=${ICON_MARK_VERSION}`}
          alt=""
          width={64}
          height={64}
          decoding="async"
        />
        <div className="landing-hero__match-caption-copy">
          <p className="landing-hero__match-caption-title">
            BiteMate <span>Profile Match</span>
          </p>
          <p className="landing-hero__match-caption-tag">Real people. Real food. Real connection.</p>
        </div>
      </div>
    </figure>
  );
}

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

function LandingGalleryRow() {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const count = GALLERY_IMAGES.length;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [count]);

  const visible = [0, 1, 2].map((offset) => GALLERY_IMAGES[(index + offset) % count]);

  return (
    <section className="landing-card landing-gallery landing-gallery--ref" aria-labelledby="landing-gallery-title">
      <div className="landing-gallery__inner">
        <h2 id="landing-gallery-title" className="landing-section-title landing-section-title--center landing-section-title--light">
          {t('landing.footer.tagline')}
        </h2>
        <div className="landing-gallery__slideshow">
          <button
            type="button"
            className="landing-gallery__arrow landing-gallery__arrow--prev"
            aria-label="Previous"
            onClick={() => setIndex((current) => (current - 1 + count) % count)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="landing-gallery__track">
            {visible.map((image, slot) => (
              <figure key={`${image.src}-${slot}`} className="landing-gallery__card">
                <img src={image.src} alt={image.alt} loading="lazy" />
              </figure>
            ))}
          </div>
          <button
            type="button"
            className="landing-gallery__arrow landing-gallery__arrow--next"
            aria-label="Next"
            onClick={() => setIndex((current) => (current + 1) % count)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

export function LandingPage() {
  const { t } = useI18n();
  const { isAuthenticated, isOtpVerified } = useAuth();
  const inApp = isAuthenticated && isOtpVerified;

  return (
    <main className="landing-page landing-page--ref landing-page--canvas">
      <section className="landing-card landing-hero landing-hero--ref" aria-labelledby="landing-hero-title">
        <div className="landing-hero__bg" aria-hidden>
          <img src="/brand/landing-hero-dining.jpg" alt="" loading="eager" decoding="async" />
        </div>
        <div className="landing-hero__scrim" aria-hidden />
        <div className="landing-hero__inner">
          <div className="landing-hero__copy">
            <p className="landing-hero__badge">{t('landing.footer.tagline')}</p>
            <LandingHeroTitle title={t('landing.hero.title')} />
            <p className="landing-hero__subtitle">{t('landing.hero.subtitle')}</p>
            <div className="landing-hero__actions">
              {inApp ? (
                <Link to="/feed" className="btn-primary landing-btn landing-btn--primary landing-btn--hero">
                  {t('nav.openApp')}
                </Link>
              ) : (
                <>
                  <Link to="/register" state={{ authIntro: true }} className="btn-primary landing-btn landing-btn--primary landing-btn--hero">
                    {t('landing.hero.cta.primary')}
                  </Link>
                  <Link to="#how-it-works" className="landing-hero__cta-secondary">
                    <span className="landing-hero__play" aria-hidden>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                    {t('landing.hero.cta.secondary')}
                  </Link>
                </>
              )}
            </div>
          </div>

          <LandingHeroVisual />
        </div>
      </section>

      <section className="landing-card landing-strip landing-strip--ref" id="features" aria-label="Features">
        <div className="landing-strip__inner">
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

      <section className="landing-card landing-how landing-how--ref" id="how-it-works" aria-labelledby="landing-how-title">
        <div className="landing-how__inner">
          <h2 id="landing-how-title" className="landing-section-title landing-section-title--center landing-how__title">
            {t('landing.how.title')}
          </h2>
          <ol className="landing-how__steps landing-how__steps--ref">
            {HOW_KEYS.map(([titleKey, descKey, image]) => (
              <li key={titleKey} className="landing-how__step landing-how__step--ref">
                <div className="landing-how__phone-wrap">
                  <img className="landing-how__phone-shot" src={`/brand/${image}?v=2`} alt="" loading="lazy" />
                </div>
                <div className="landing-how__card">
                  <h3>{t(titleKey)}</h3>
                  <p>{t(descKey)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <LandingGalleryRow />

      <section className="landing-card landing-final landing-final--ref" aria-labelledby="landing-final-title">
        <div className="landing-final__inner">
          <div className="landing-final__copy">
            <h2 id="landing-final-title" className="landing-final__title">
              {t('landing.cta.title')}
            </h2>
            <p className="landing-final__lead">{t('landing.cta.subtitle')}</p>
            {!inApp ? (
              <div className="landing-final__actions">
                <Link to="/register" state={{ authIntro: true }} className="btn-primary landing-btn landing-btn--primary landing-btn--cta">
                  {t('landing.cta.getStarted')}
                </Link>
                <Link to="/about" className="landing-btn landing-btn--outline">
                  {t('landing.cta.business')}
                </Link>
              </div>
            ) : (
              <Link to="/feed" className="btn-primary landing-btn landing-btn--primary landing-btn--cta">
                {t('nav.openApp')}
              </Link>
            )}
          </div>

          <div className="landing-stats-row landing-stats-row--ref" aria-label="Stats">
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
            <article>
              <strong>4.8★</strong>
              <span>{t('landing.stats.rating')}</span>
            </article>
          </div>

          <div className="landing-final__visual" aria-hidden>
            <img className="landing-final__promo" src="/brand/landing-phone-profile-4k.jpg?v=3" alt="" loading="lazy" />
          </div>
        </div>
      </section>
    </main>
  );
}
