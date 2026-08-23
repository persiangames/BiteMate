import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BrandLockup } from '@/presentation/components/brand/BrandLockup';
import { useI18n } from '@/presentation/context/I18nContext';

export function ResetPasswordPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const identifier = (location.state as { identifier?: string } | null)?.identifier ?? '';
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 5 || password !== confirm || code.trim().length < 4) {
      setError(t('auth.error.invalid'));
      return;
    }
    setError(null);
    setDone(true);
    window.setTimeout(() => navigate('/login', { replace: true }), 900);
  }

  return (
    <main className="ig-auth">
      <section className="ig-auth__card">
        <BrandLockup size="md" />
        <h1>{t('auth.reset.title')}</h1>
        {identifier ? <p className="hint">{identifier}</p> : null}
        <form className="ig-auth__form" onSubmit={handleSubmit}>
          <input
            type="text"
            inputMode="numeric"
            placeholder={t('auth.reset.code')}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
          />
          <input
            type="password"
            placeholder={t('auth.reset.new')}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <input
            type="password"
            placeholder={t('auth.reset.confirm')}
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            required
          />
          {error ? <p className="error">{error}</p> : null}
          {done ? <p className="hint">{t('auth.reset.success')}</p> : null}
          <button type="submit" className="btn-primary" disabled={done}>
            {t('auth.reset.save')}
          </button>
        </form>
        <Link className="ig-auth__forgot" to="/login">
          {t('auth.login')}
        </Link>
      </section>
    </main>
  );
}
