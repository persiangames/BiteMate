import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/presentation/context/I18nContext';

const FAQ_COUNT = 8;

export function FaqPage() {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <main className="static-page">
      <div className="static-page__inner glass-card glass-card--lg">
        <h1>{t('faq.title')}</h1>
        <p className="static-page__lead">{t('faq.subtitle')}</p>

        <div className="faq-list">
          {Array.from({ length: FAQ_COUNT }, (_, index) => {
            const n = index + 1;
            const isOpen = open === index;
            return (
              <article key={n} className={`faq-item${isOpen ? ' faq-item--open' : ''}`}>
                <button
                  type="button"
                  className="faq-item__question"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : index)}
                >
                  <span>{t(`faq.q${n}`)}</span>
                  <span className="faq-item__chevron" aria-hidden>
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen ? <p className="faq-item__answer">{t(`faq.a${n}`)}</p> : null}
              </article>
            );
          })}
        </div>

        <div className="static-page__actions">
          <Link to="/register" state={{ authIntro: true }} className="btn-primary">
            {t('nav.signup')}
          </Link>
          <Link to="/about">{t('nav.about')}</Link>
        </div>
      </div>
    </main>
  );
}
