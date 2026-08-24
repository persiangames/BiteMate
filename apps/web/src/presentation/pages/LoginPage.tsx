import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandLockup } from '@/presentation/components/brand/BrandLockup';
import { SocialAuthButtons } from '@/presentation/components/auth/SocialAuthButtons';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';
import { verifyTwoFactorLogin } from '@/data/repositories/authRepository';

export function LoginPage() {
  const { login, setSession } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function afterAuth(otpVerified: boolean) {
    navigate(otpVerified ? '/feed' : '/verify-otp', { replace: true });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (challengeToken) {
        const response = await verifyTwoFactorLogin({ challengeToken, code: otpCode });
        setSession(response);
        afterAuth(response.user.otpVerified);
        return;
      }

      const response = await login(identifier, password);
      if (response.twoFactorRequired && response.challengeToken) {
        setChallengeToken(response.challengeToken);
        return;
      }
      afterAuth(response.user.otpVerified);
    } catch {
      setError(t('auth.error.invalid'));
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = challengeToken
    ? otpCode.length === 6 && !loading
    : identifier.trim().length > 0 && password.length > 0 && !loading;

  return (
    <main className="ig-auth">
      <section className="ig-auth__card">
        <BrandLockup size="md" />
        <form className="ig-auth__form" onSubmit={(event) => void handleSubmit(event)}>
          {challengeToken ? (
            <input
              value={otpCode}
              onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder={t('otp.code')}
              inputMode="numeric"
              autoComplete="one-time-code"
              required
            />
          ) : (
            <>
              <input
                type="text"
                autoComplete="username"
                placeholder={t('auth.identifier')}
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                required
              />
              <input
                type="password"
                autoComplete="current-password"
                placeholder={t('auth.password')}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </>
          )}
          {error ? <p className="error">{error}</p> : null}
          <button type="submit" className="btn-primary" disabled={!canSubmit}>
            {loading ? '...' : challengeToken ? t('settings.2fa.confirm') : t('auth.login')}
          </button>
          {!challengeToken ? (
            <>
              <div className="ig-auth__divider">
                <span>{t('auth.or')}</span>
              </div>
              <SocialAuthButtons
                mode="login"
                onGoogleNeedsProfile={() => navigate('/register', { state: { social: 'google' } })}
                onSuccess={(otpVerified) => afterAuth(otpVerified)}
              />
              <Link className="ig-auth__forgot" to="/forgot-password">
                {t('auth.forgot')}
              </Link>
            </>
          ) : null}
        </form>
      </section>

      <section className="ig-auth__card ig-auth__card--compact">
        <p>
          {t('auth.signup.prompt')} <Link to="/register">{t('auth.register')}</Link>
        </p>
      </section>
    </main>
  );
}
