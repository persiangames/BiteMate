import { FormEvent, useEffect, useMemo, useState } from 'react';
import { requestOtp } from '@/data/repositories/authRepository';
import { BrandLockup } from '@/presentation/components/brand/BrandLockup';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';
import { localizeError } from '@/presentation/i18n/localizeError';

export function VerifyOtpPage() {
  const { user, accessToken, completeOtp } = useAuth();
  const { t } = useI18n();
  const destination = useMemo(
    () => user?.phoneNumber || user?.email || '',
    [user?.phoneNumber, user?.email],
  );
  const channel = destination.includes('@') ? 'email' : 'phone';
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendCode() {
    if (!accessToken || !destination) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await requestOtp(accessToken, destination);
      setDevCode(response.devCode ?? null);
    } catch (err) {
      setError(localizeError(t, err, 'auth.otp.failed'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void sendCode();
    // Send once when the page opens with a destination.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, destination]);

  async function handleVerify(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await completeOtp(destination, code);
      window.location.href = '/feed';
    } catch (err) {
      setError(localizeError(t, err, 'auth.otp.invalid'));
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
        <div>
          <p className="hint">{t('auth.otp.security')}</p>
          <h1>{t('auth.otp.title')}</h1>
          <p className="hint">
            {channel === 'email' ? t('auth.otp.emailHint') : t('auth.otp.phoneHint')}
          </p>
        </div>

        <label className="field">
          <span>{channel === 'email' ? t('auth.email') : t('auth.phone')}</span>
          <input value={destination} readOnly />
        </label>

        <button type="button" className="btn-secondary" onClick={() => void sendCode()} disabled={loading || !destination}>
          {t('auth.otp.send')}
        </button>

        {devCode && <p className="hint">{t('otp.dev', { code: devCode })}</p>}

        <form className="flow" onSubmit={handleVerify}>
          <label className="field">
            <span>{t('auth.otp.code')}</span>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              pattern="\d{6}"
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading || code.length !== 6}>
            {loading ? t('save.saving') : t('auth.continue')}
          </button>
        </form>
      </section>
    </main>
  );
}
