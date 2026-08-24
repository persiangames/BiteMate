import { useState } from 'react';
import { isFirebaseConfigured, signInWithGoogle } from '@/data/firebase/firebaseClient';
import {
  requestLoginOtp,
  verifyLoginOtp,
} from '@/data/repositories/authRepository';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';
import { localizeError } from '@/presentation/i18n/localizeError';

type SocialAuthMode = 'login' | 'register';

interface SocialAuthButtonsProps {
  mode: SocialAuthMode;
  onGoogleNeedsProfile?: () => void;
  onSuccess?: (otpVerified: boolean) => void;
}

function GoogleIcon() {
  return (
    <svg className="social-auth__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function SocialAuthButtons({
  mode,
  onGoogleNeedsProfile,
  onSuccess,
}: SocialAuthButtonsProps) {
  const { socialLogin, setSession, locale } = useAuth();
  const { t } = useI18n();
  const [phoneMode, setPhoneMode] = useState(false);
  const [destination, setDestination] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const googleEnabled = isFirebaseConfigured();

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    let idToken: string | null = null;
    try {
      idToken = await signInWithGoogle();
      const response = await socialLogin({ idToken, locale });
      onSuccess?.(response.user.otpVerified);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (
        mode === 'login' &&
        idToken &&
        (message.includes('Role is required') || message.includes('400'))
      ) {
        onGoogleNeedsProfile?.();
        return;
      }
      setError(localizeError(t, err, 'auth.socialFailed'));
    } finally {
      setLoading(false);
    }
  }

  async function sendPhoneCode() {
    if (!destination.trim()) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await requestLoginOtp(destination.trim());
      setCodeSent(true);
      setDevCode(response.devCode ?? null);
    } catch (err) {
      setError(localizeError(t, err, 'auth.otp.failed'));
    } finally {
      setLoading(false);
    }
  }

  async function verifyPhoneCode() {
    if (code.length !== 6) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await verifyLoginOtp({
        destination: destination.trim(),
        code,
        locale,
      });
      setSession(response);
      onSuccess?.(response.user.otpVerified);
    } catch (err) {
      setError(localizeError(t, err, 'auth.otp.invalid'));
    } finally {
      setLoading(false);
    }
  }

  if (phoneMode) {
    return (
      <div className="social-auth flow">
        <p className="hint">{t('auth.phoneLoginHint')}</p>
        <input
          type="text"
          autoComplete="username"
          placeholder={t('auth.identifier')}
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          disabled={codeSent}
        />
        {codeSent ? (
          <>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder={t('otp.code')}
              inputMode="numeric"
              autoComplete="one-time-code"
            />
            {devCode ? <p className="hint">{t('otp.dev', { code: devCode })}</p> : null}
            <button
              type="button"
              className="btn-primary"
              disabled={loading || code.length !== 6}
              onClick={() => void verifyPhoneCode()}
            >
              {loading ? '...' : t('auth.login')}
            </button>
            <button
              type="button"
              className="btn-ghost"
              disabled={loading}
              onClick={() => void sendPhoneCode()}
            >
              {t('auth.otp.send')}
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn-primary"
            disabled={loading || !destination.trim()}
            onClick={() => void sendPhoneCode()}
          >
            {loading ? '...' : t('auth.otp.send')}
          </button>
        )}
        {error ? <p className="error">{error}</p> : null}
        <button type="button" className="btn-ghost" onClick={() => setPhoneMode(false)}>
          {t('auth.back')}
        </button>
      </div>
    );
  }

  return (
    <div className="social-auth">
      {googleEnabled ? (
        <button
          type="button"
          className="social-auth__btn social-auth__btn--google"
          disabled={loading}
          onClick={() => void handleGoogle()}
        >
          <GoogleIcon />
          {t('auth.google')}
        </button>
      ) : (
        <p className="hint">{t('auth.socialUnavailable')}</p>
      )}
      <button
        type="button"
        className="social-auth__btn social-auth__btn--phone"
        disabled={loading}
        onClick={() => {
          setPhoneMode(true);
          setError(null);
          setCodeSent(false);
          setCode('');
        }}
      >
        {t('auth.phoneLogin')}
      </button>
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
