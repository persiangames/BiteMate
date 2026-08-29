import { useState } from 'react';
import { isFirebaseConfigured, signInWithGoogle } from '@/data/firebase/firebaseClient';
import {
  requestLoginOtp,
  verifyLoginOtp,
} from '@/data/repositories/authRepository';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';
import { localizeError } from '@/presentation/i18n/localizeError';
import { GoogleIcon } from '@/presentation/components/auth/GoogleIcon';

type SocialAuthMode = 'login' | 'register';

interface SocialAuthButtonsProps {
  mode: SocialAuthMode;
  onGoogleNeedsProfile?: () => void;
  onSuccess?: (otpVerified: boolean) => void;
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
