import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { resetPassword } from '@/data/repositories/authRepository';
import { BrandLockup } from '@/presentation/components/brand/BrandLockup';
import { useI18n } from '@/presentation/context/I18nContext';
import { localizeError } from '@/presentation/i18n/localizeError';

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
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8 || password !== confirm || code.length !== 6) {
      setError(t('auth.error.invalid'));
      return;
    }
    if (!identifier) {
      setError(t('auth.error.invalid'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await resetPassword({ identifier, code, newPassword: password });
      setDone(true);
      window.setTimeout(() => navigate('/login', { replace: true }), 900);
    } catch (err) {
      setError(localizeError(t, err, 'auth.otp.invalid'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ig-auth">
      <section className="ig-auth__card">
        <BrandLockup size="md" />
        <h1>{t('auth.reset.title')}</h1>
        {identifier ? <p className="hint">{identifier}</p> : null}
        <form className="ig-auth__form" onSubmit={(event) => void handleSubmit(event)}>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder={t('auth.reset.code')}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            required
          />
          <input
            type="password"
            autoComplete="new-password"
            placeholder={t('auth.reset.new')}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
          <input
            type="password"
            autoComplete="new-password"
            placeholder={t('auth.reset.confirm')}
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            minLength={8}
            required
          />
          {error ? <p className="error">{error}</p> : null}
          {done ? <p className="hint">{t('auth.reset.success')}</p> : null}
          <button type="submit" className="btn-primary" disabled={done || loading}>
            {loading ? '...' : t('auth.reset.save')}
          </button>
        </form>
        <Link className="ig-auth__forgot" to="/login">
          {t('auth.login')}
        </Link>
      </section>
    </main>
  );
}
