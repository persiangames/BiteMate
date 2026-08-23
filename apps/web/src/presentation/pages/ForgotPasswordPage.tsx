import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandLockup } from '@/presentation/components/brand/BrandLockup';
import { useI18n } from '@/presentation/context/I18nContext';

export function ForgotPasswordPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSent(true);
    window.setTimeout(() => {
      navigate('/reset-password', { state: { identifier } });
    }, 700);
  }

  return (
    <main className="ig-auth">
      <section className="ig-auth__card">
        <BrandLockup size="md" />
        <h1>{t('auth.forgot.title')}</h1>
        <p className="hint">{t('auth.forgot.hint')}</p>
        <form className="ig-auth__form" onSubmit={handleSubmit}>
          <input
            type="text"
            autoComplete="username"
            placeholder={t('auth.identifier')}
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            required
          />
          {sent ? <p className="hint">{t('auth.forgot.sent')}</p> : null}
          <button type="submit" className="btn-primary" disabled={!identifier.trim()}>
            {t('auth.forgot.send')}
          </button>
        </form>
        <Link className="ig-auth__forgot" to="/login">
          {t('auth.login')}
        </Link>
      </section>
    </main>
  );
}
