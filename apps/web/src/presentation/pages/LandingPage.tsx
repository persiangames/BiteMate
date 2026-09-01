import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
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
  { src: '/brand/landing-slide-01.jpg', alt: 'Friends dining together' },
  { src: '/brand/landing-slide-02.jpg', alt: 'Senior friends at a luxury dinner' },
  { src: '/brand/landing-slide-03.jpg', alt: 'Couples at a restaurant' },
  { src: '/brand/landing-slide-04.jpg', alt: 'Street food meetup' },
  { src: '/brand/landing-slide-05.jpg', alt: 'Brunch with friends' },
] as const;

function LandingGallerySlideshow() {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const pauseRef = useRef(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (pauseRef.current) {
        return;
      }
      setIndex((current) => (current + 1) % GALLERY_IMAGES.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  function go(delta: number) {
    pauseRef.current = true;
    setIndex((current) => (current + delta + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
    window.setTimeout(() => {
      pauseRef.current = false;
    }, 8000);
  }

  return (
    <section className="landing-gallery" aria-labelledby="landing-gallery-title">
      <div className="landing-gallery__glow" aria-hidden />
      <div className="landing-gallery__inner">
        <h2 id="landing-gallery-title" className="landing-section-title landing-section-title--center landing-section-title--light">
          {t('landing.footer.tagline')}
        </h2>
        <div className="landing-slideshow">
          <button type="button" className="landing-slideshow__nav landing-slideshow__nav--prev" aria-label="Previous" onClick={() => go(-1)}>
            ‹
          </button>
          <div className="landing-slideshow__viewport">
            {GALLERY_IMAGES.map((image, imageIndex) => (
              <figure
                key={image.src}
                className={`landing-slideshow__slide${imageIndex === index ? ' is-active' : ''}`}
                aria-hidden={imageIndex !== index}
              >
                <img src={image.src} alt={image.alt} loading={imageIndex === 0 ? 'eager' : 'lazy'} />
              </figure>
            ))}
          </div>
          <button type="button" className="landing-slideshow__nav landing-slideshow__nav--next" aria-label="Next" onClick={() => go(1)}>
            ›
          </button>
          <div className="landing-slideshow__dots" aria-hidden>
            {GALLERY_IMAGES.map((image, dotIndex) => (
              <span key={image.src} className={dotIndex === index ? 'is-active' : ''} />
            ))}
          </div>
        </div>
      </div>
    </section>
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

function HeroOrbits() {
  return (
    <div className="landing-hero__orbits" aria-hidden>
      <svg className="landing-hero__orbit landing-hero__orbit--a" viewBox="0 0 200 200">
        <ellipse cx="100" cy="100" rx="88" ry="42" fill="none" stroke="url(#orbitGrad)" strokeWidth="1.2" strokeDasharray="4 8" />
        <defs>
          <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff8a00" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#ff4b3e" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffd54f" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>
      <svg className="landing-hero__orbit landing-hero__orbit--b" viewBox="0 0 200 200">
        <ellipse cx="100" cy="100" rx="72" ry="58" fill="none" stroke="rgba(255,138,0,0.25)" strokeWidth="1" />
      </svg>
      <span className="landing-hero__float-icon landing-hero__float-icon--heart">♥</span>
      <span className="landing-hero__float-icon landing-hero__float-icon--pin">📍</span>
    </div>
  );
}

export function LandingPage() {
  const { t } = useI18n();
  const { isAuthenticated, isOtpVerified } = useAuth();
  const inApp = isAuthenticated && isOtpVerified;

  return (
    <main className="landing-page">
      <section className="landing-hero" aria-labelledby="landing-hero-title">
        <div className="landing-hero__glow" aria-hidden />
        <HeroOrbits />
        <div className="landing-hero__inner">
          <div className="landing-hero__copy">
            <BrandLockup size="lg" tone="light" showTagline={false} />
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
                  <Link to="#how-it-works" className="landing-btn landing-btn--ghost">
                    {t('landing.hero.cta.secondary')}
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="landing-hero__visual">
            <div className="landing-devices">
              <img
                className="landing-devices__phone landing-devices__phone--profile"
                src="/brand/landing-phone-profile-dark.png"
                alt=""
                width={280}
                height={560}
                loading="eager"
                decoding="async"
              />
              <img
                className="landing-devices__phone landing-devices__phone--map"
                src="/brand/landing-phone-map-dark.png"
                alt=""
                width={320}
                height={640}
                loading="eager"
                decoding="async"
              />
            </div>
            <div className="landing-hero__portraits">
              <img className="landing-hero__portrait landing-hero__portrait--a" src="/brand/landing-portrait-mixed.jpg" alt="" loading="lazy" />
              <img className="landing-hero__portrait landing-hero__portrait--b" src="/brand/landing-portrait-seniors-dining.jpg" alt="" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="landing-strip" id="features" aria-label="Features">
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

      <section className="landing-how" id="how-it-works" aria-labelledby="landing-how-title">
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
              </li>
            ))}
          </ol>
        </div>
      </section>

      <LandingGallerySlideshow />

      <section className="landing-final" aria-labelledby="landing-final-title">
        <div className="landing-final__inner">
          <div className="landing-final__copy">
            <h2 id="landing-final-title" className="landing-final__title">
              {t('landing.cta.title')}
            </h2>
            <p className="landing-final__lead">{t('landing.cta.subtitle')}</p>
            {!inApp ? (
              <div className="landing-hero__actions landing-hero__actions--start">
                <Link to="/register" state={{ authIntro: true }} className="btn-primary landing-btn landing-btn--primary">
                  {t('landing.hero.cta.primary')}
                </Link>
              </div>
            ) : (
              <Link to="/feed" className="btn-primary landing-btn landing-btn--primary">
                {t('nav.openApp')}
              </Link>
            )}
          </div>
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
        </div>
      </section>
    </main>
  );
}
