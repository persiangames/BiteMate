import { useEffect, useRef, useState } from 'react';
import type { SupportedLocale } from '@bitemate/shared';
import { APP_LOCALES } from '@/presentation/i18n/catalogs';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';

export function LanguageSwitcher() {
  const { locale, setLocale, markLanguageSelected } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  async function choose(code: SupportedLocale) {
    await setLocale(code);
    markLanguageSelected();
    setOpen(false);
  }

  return (
    <div className="language-switcher" ref={rootRef}>
      <button
        type="button"
        className="language-switcher__button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="language-switcher__gear" aria-hidden>
          ⚙
        </span>
        <span>{t('language.title')}</span>
      </button>
      {open ? (
        <ul className="language-switcher__menu" role="listbox" aria-label={t('language.title')}>
          {APP_LOCALES.map((item) => (
            <li key={item.code}>
              <button
                type="button"
                role="option"
                aria-selected={locale === item.code}
                className={locale === item.code ? 'selected' : undefined}
                onClick={() => void choose(item.code)}
              >
                {item.name.toLowerCase()}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
