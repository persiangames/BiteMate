import { useState } from 'react';
import type { SupportedLocale } from '@bitemate/shared';
import { APP_LOCALES } from '@/presentation/i18n/catalogs';
import { BrandLockup } from '@/presentation/components/brand/BrandLockup';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';

export function LanguagePage() {
  const { locale, setLocale, markLanguageSelected } = useAuth();
  const { t } = useI18n();
  const [selected, setSelected] = useState<SupportedLocale>(locale);
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    setLoading(true);
    try {
      await setLocale(selected);
      markLanguageSelected();
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-screen__panel glass-card glass-card--lg flow">
        <div className="auth-brand">
          <BrandLockup size="md" />
        </div>
        <div className="screen-header">
          <div>
            <p className="hint">BiteMate</p>
            <h1>{t('language.title')}</h1>
          </div>
        </div>

        <div className="language-list">
          {APP_LOCALES.map((item) => (
            <button
              key={item.code}
              type="button"
              className={`language-list__item${selected === item.code ? ' selected' : ''}`}
              onClick={() => setSelected(item.code)}
            >
              {item.name.toLowerCase()}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn-primary"
          disabled={loading}
          onClick={() => void handleContinue()}
        >
          {loading ? '...' : t('auth.continue')}
        </button>
      </section>
    </main>
  );
}
