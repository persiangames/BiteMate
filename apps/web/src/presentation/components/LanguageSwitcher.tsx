import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { SupportedLocale } from '@bitemate/shared';
import { APP_LOCALES } from '@/presentation/i18n/catalogs';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';

const MARKETING_PATHS = new Set(['/', '/about', '/faq']);

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3 12h18M12 3c2.5 2.8 3.8 6 3.8 9s-1.3 6.2-3.8 9M12 3c-2.5 2.8-3.8 6-3.8 9s1.3 6.2 3.8 9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type LanguageSwitcherProps = {
  placement?: 'floating' | 'header' | 'marketing';
};

export function LanguageSwitcher({ placement = 'floating' }: LanguageSwitcherProps) {
  const { pathname } = useLocation();
  const { locale, setLocale, markLanguageSelected, isAuthenticated, isOtpVerified } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inApp = isAuthenticated && isOtpVerified;
  const onMarketingPage = MARKETING_PATHS.has(pathname);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [open]);

  if (placement === 'floating' && (inApp || onMarketingPage)) {
    return null;
  }
  if (placement === 'header' && !inApp) {
    return null;
  }

  async function choose(code: SupportedLocale) {
    await setLocale(code);
    markLanguageSelected();
    setOpen(false);
  }

  const rootClass =
    placement === 'header'
      ? 'language-switcher language-switcher--header'
      : placement === 'marketing'
        ? 'language-switcher language-switcher--marketing'
        : 'language-switcher language-switcher--floating';

  const localeCode = locale.toUpperCase().slice(0, 2);

  return (
    <div className={rootClass} ref={rootRef}>
      <button
        type="button"
        className="language-switcher__button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t('language.title')}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
      >
        <span className="language-switcher__icon" aria-hidden>
          <GlobeIcon />
        </span>
        {placement === 'marketing' ? (
          <>
            <span className="language-switcher__code">{localeCode}</span>
            <span className="language-switcher__chevron" aria-hidden>
              <ChevronDownIcon />
            </span>
          </>
        ) : placement === 'floating' ? (
          <span>Ln</span>
        ) : null}
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
