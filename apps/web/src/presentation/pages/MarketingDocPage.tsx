import { Link } from 'react-router-dom';
import { useI18n } from '@/presentation/context/I18nContext';

export const MARKETING_DOC_IDS = [
  'careers',
  'press',
  'contact',
  'help',
  'safety',
  'guidelines',
  'privacy',
  'partners',
  'restaurant-partners',
  'advertise',
  'terms',
  'cookies',
] as const;

export type MarketingDocId = (typeof MARKETING_DOC_IDS)[number];

export function MarketingDocPage({ doc }: { doc: MarketingDocId }) {
  const { t } = useI18n();

  return (
    <main className="static-page">
      <div className="static-page__inner glass-card glass-card--lg">
        <h1>{t(`doc.${doc}.title`)}</h1>
        <p className="static-page__lead">{t(`doc.${doc}.lead`)}</p>
        {[1, 2, 3].map((n) => (
          <section key={n}>
            <h2>{t(`doc.${doc}.s${n}.title`)}</h2>
            <p>{t(`doc.${doc}.s${n}.body`)}</p>
          </section>
        ))}
        <div className="static-page__actions">
          <Link to="/register" state={{ authIntro: true }} className="marketing-nav__cta marketing-nav__cta--primary">
            {t('nav.signup')}
          </Link>
          <Link to="/">{t('app.name')}</Link>
        </div>
      </div>
    </main>
  );
}
