import { Link } from 'react-router-dom';
import { useI18n } from '@/presentation/context/I18nContext';

const MODULE_KEYS = [
  'about.modules.feed',
  'about.modules.discover',
  'about.modules.meetups',
  'about.modules.chat',
  'about.modules.marketplace',
  'about.modules.wallet',
] as const;

export function AboutPage() {
  const { t } = useI18n();

  return (
    <main className="static-page">
      <div className="static-page__inner glass-card glass-card--lg">
        <h1>{t('about.title')}</h1>
        <p className="static-page__lead">{t('about.intro')}</p>

        <section>
          <h2>{t('about.who.title')}</h2>
          <p>{t('about.who.body')}</p>
        </section>

        <section>
          <h2>{t('about.why.title')}</h2>
          <p>{t('about.why.body')}</p>
        </section>

        <section>
          <h2>{t('about.modules.title')}</h2>
          <ul className="static-page__list">
            {MODULE_KEYS.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2>{t('about.revenue.title')}</h2>
          <p>{t('about.revenue.body')}</p>
        </section>

        <section>
          <h2>{t('about.safety.title')}</h2>
          <p>{t('about.safety.body')}</p>
        </section>

        <div className="static-page__actions">
          <Link to="/register" state={{ authIntro: true }} className="marketing-nav__cta marketing-nav__cta--primary">
            {t('nav.signup')}
          </Link>
          <Link to="/faq">{t('nav.faq')}</Link>
        </div>
      </div>
    </main>
  );
}
