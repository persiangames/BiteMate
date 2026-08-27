import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  USER_ROLES,
  USERNAME_PATTERN,
  isOldEnough,
  isValidE164Phone,
  isValidPassword,
  isValidUsername,
  normalizePhoneInput,
  type UserRole,
} from '@bitemate/shared';
import { checkUsernameAvailablePublic } from '@/data/repositories/authRepository';
import { isFirebaseConfigured, signInWithGoogle } from '@/data/firebase/firebaseClient';
import { BrandLockup } from '@/presentation/components/brand/BrandLockup';
import { PasswordField } from '@/presentation/components/auth/PasswordField';
import { SearchableSelect } from '@/presentation/components/SearchableSelect';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';
import { citySelectOptions, countrySelectOptions } from '@/data/localize';
import { localizeError } from '@/presentation/i18n/localizeError';

type AuthMethod = 'email' | 'phone' | 'google';

export function RegisterPage() {
  const { register, socialLogin, locale } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);
  const [googleIdToken, setGoogleIdToken] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    username: '',
    fullName: '',
    phoneNumber: '',
    country: '',
    city: '',
    dateOfBirth: '',
    role: 'NORMAL_USER' as UserRole,
  });
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const totalSteps = 4;

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const countryOptions = useMemo(() => countrySelectOptions(locale), [locale]);
  const cityOptions = useMemo(() => citySelectOptions(form.country, locale), [form.country, locale]);

  useEffect(() => {
    const username = form.username.trim().toLowerCase();
    if (!username) {
      setUsernameStatus('idle');
      return;
    }
    if (!USERNAME_PATTERN.test(username)) {
      setUsernameStatus('invalid');
      return;
    }

    setUsernameStatus('checking');
    const timer = window.setTimeout(() => {
      void checkUsernameAvailablePublic(username)
        .then((result) => setUsernameStatus(result.available ? 'available' : 'taken'))
        .catch(() => setUsernameStatus('idle'));
    }, 400);

    return () => window.clearTimeout(timer);
  }, [form.username]);

  function validateCredentialsStep(): boolean {
    if (!isValidPassword(form.password)) {
      setError(t('auth.password.rules'));
      return false;
    }
    if (form.password !== form.passwordConfirm) {
      setError(t('auth.password.mismatch'));
      return false;
    }
    if (authMethod === 'phone') {
      const normalized = normalizePhoneInput(form.phoneNumber);
      if (!isValidE164Phone(normalized)) {
        setError(t('auth.error.phoneFormat'));
        return false;
      }
    }
    setError(null);
    return true;
  }

  function validateProfileStep(): boolean {
    if (!form.fullName || !form.country || !form.city || !form.dateOfBirth) {
      setError(t('auth.completeProfile'));
      return false;
    }
    if (!isOldEnough(form.dateOfBirth)) {
      setError(t('auth.error.tooYoung'));
      return false;
    }
    const username = form.username.trim().toLowerCase();
    if (username) {
      if (!isValidUsername(username)) {
        setError(t('profile.username.invalid'));
        return false;
      }
      if (usernameStatus === 'taken') {
        setError(t('profile.username.taken'));
        return false;
      }
      if (usernameStatus === 'checking') {
        setError(t('profile.usernameChecking'));
        return false;
      }
    }
    setError(null);
    return true;
  }

  async function submitRegistration() {
    if (!authMethod) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (authMethod === 'google' && googleIdToken) {
        const created = await socialLogin({
          idToken: googleIdToken,
          fullName: form.fullName,
          country: form.country,
          city: form.city,
          dateOfBirth: form.dateOfBirth,
          role: form.role,
          locale,
        });
        navigate(created.user.otpVerified ? '/feed' : '/verify-otp', { replace: true });
        return;
      }

      const phoneNumber =
        authMethod === 'phone' ? normalizePhoneInput(form.phoneNumber) : undefined;

      const created = await register({
        channel: authMethod,
        email: authMethod === 'email' ? form.email.trim().toLowerCase() : undefined,
        phoneNumber,
        password: form.password,
        username: form.username.trim() || undefined,
        fullName: form.fullName.trim(),
        country: form.country,
        city: form.city,
        dateOfBirth: form.dateOfBirth,
        role: form.role,
        locale,
      });
      navigate(created.user.otpVerified ? '/feed' : '/verify-otp', { replace: true });
    } catch (err) {
      setError(localizeError(t, err, 'auth.registerFailed'));
    } finally {
      setLoading(false);
    }
  }

  async function startGoogleRegistration() {
    setLoading(true);
    setError(null);
    try {
      const idToken = await signInWithGoogle();
      setGoogleIdToken(idToken);
      setAuthMethod('google');
      setStep(3);
    } catch (err) {
      setError(localizeError(t, err, 'auth.socialFailed'));
    } finally {
      setLoading(false);
    }
  }

  const usernameHint =
    usernameStatus === 'checking'
      ? t('profile.usernameChecking')
      : usernameStatus === 'available'
        ? t('profile.usernameOk')
        : usernameStatus === 'taken'
          ? t('profile.username.taken')
          : usernameStatus === 'invalid'
            ? t('profile.username.invalid')
            : null;

  const profileFields = (
    <>
      <label className="field">
        <span>{t('auth.username')}</span>
        <input
          value={form.username}
          onChange={(event) => updateField('username', event.target.value.toLowerCase())}
          placeholder={t('auth.optional')}
          autoComplete="username"
          pattern="[a-z0-9_]{3,30}"
        />
        {usernameHint ? (
          <span
            className={`hint${usernameStatus === 'taken' || usernameStatus === 'invalid' ? ' error' : ''}`}
          >
            {usernameHint}
          </span>
        ) : null}
      </label>
      <label className="field">
        <span>{t('auth.fullName')}</span>
        <input
          value={form.fullName}
          onChange={(event) => updateField('fullName', event.target.value)}
          required
          autoComplete="name"
        />
      </label>
      <SearchableSelect
        label={t('auth.country')}
        value={form.country}
        options={countryOptions}
        placeholder={t('auth.searchHint')}
        onChange={(country) => {
          updateField('country', country);
          updateField('city', '');
        }}
      />
      <SearchableSelect
        label={t('auth.city')}
        value={form.city}
        options={cityOptions}
        placeholder={form.country ? t('auth.searchHint') : t('auth.selectCountryFirst')}
        disabled={!form.country}
        onChange={(city) => updateField('city', city)}
      />
      <label className="field">
        <span>{t('auth.dob')}</span>
        <input
          type="date"
          value={form.dateOfBirth}
          onChange={(event) => updateField('dateOfBirth', event.target.value)}
          required
          max={new Date().toISOString().slice(0, 10)}
        />
      </label>
    </>
  );

  return (
    <main className="auth-screen">
      <section className="auth-screen__panel glass-card glass-card--lg flow">
        <div className="auth-brand">
          <BrandLockup size="md" />
        </div>
        <div>
          <p className="hint">{t('auth.step', { current: Math.min(step, totalSteps), total: totalSteps })}</p>
          <h1>{t('auth.register')}</h1>
        </div>

        <div className="wizard-steps">
          {Array.from({ length: totalSteps }, (_, index) => (
            <div key={index} className={`wizard-step${step > index ? ' active' : ''}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="flow">
            <p className="hint">{t('auth.chooseChannel')}</p>
            {isFirebaseConfigured() ? (
              <button
                type="button"
                className="social-auth__btn social-auth__btn--google"
                disabled={loading}
                onClick={() => void startGoogleRegistration()}
              >
                {t('auth.google')}
              </button>
            ) : (
              <p className="hint">{t('auth.socialUnavailable')}</p>
            )}
            <div className="ig-auth__divider">
              <span>{t('auth.or')}</span>
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setAuthMethod('email');
                setError(null);
                setStep(2);
              }}
            >
              {t('auth.email')}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setAuthMethod('phone');
                setError(null);
                setStep(2);
              }}
            >
              {t('auth.phone')}
            </button>
          </div>
        )}

        {step === 2 && authMethod === 'email' && (
          <form
            className="flow"
            onSubmit={(event) => {
              event.preventDefault();
              if (validateCredentialsStep()) {
                setStep(3);
              }
            }}
          >
            <label className="field">
              <span>{t('auth.email')}</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                required
                autoComplete="email"
              />
            </label>
            <PasswordField
              label={t('auth.password')}
              value={form.password}
              onChange={(value) => updateField('password', value)}
              confirmLabel={t('auth.password.confirm')}
              confirmValue={form.passwordConfirm}
              onConfirmChange={(value) => updateField('passwordConfirm', value)}
              rulesLabel={t('auth.password.rules')}
              mismatchLabel={t('auth.password.mismatch')}
            />
            <p className="hint">{t('auth.emailOtpHint')}</p>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn-primary">
              {t('auth.continue')}
            </button>
          </form>
        )}

        {step === 2 && authMethod === 'phone' && (
          <form
            className="flow"
            onSubmit={(event) => {
              event.preventDefault();
              if (validateCredentialsStep()) {
                setStep(3);
              }
            }}
          >
            <label className="field">
              <span>{t('auth.phone')}</span>
              <input
                value={form.phoneNumber}
                onChange={(event) => updateField('phoneNumber', event.target.value)}
                placeholder="09121234567 یا +989121234567"
                required
                inputMode="tel"
                autoComplete="tel"
              />
            </label>
            <PasswordField
              label={t('auth.password')}
              value={form.password}
              onChange={(value) => updateField('password', value)}
              confirmLabel={t('auth.password.confirm')}
              confirmValue={form.passwordConfirm}
              onConfirmChange={(value) => updateField('passwordConfirm', value)}
              rulesLabel={t('auth.password.rules')}
              mismatchLabel={t('auth.password.mismatch')}
            />
            <p className="hint">{t('auth.phoneOtpHint')}</p>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn-primary">
              {t('auth.continue')}
            </button>
          </form>
        )}

        {step === 3 && (
          <form
            className="flow"
            onSubmit={(event) => {
              event.preventDefault();
              if (validateProfileStep()) {
                setStep(4);
              }
            }}
          >
            {profileFields}
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn-primary">
              {t('auth.continue')}
            </button>
          </form>
        )}

        {step === 4 && (
          <form
            className="flow"
            onSubmit={(event: FormEvent) => {
              event.preventDefault();
              void submitRegistration();
            }}
          >
            <p className="hint">{t('auth.role')}</p>
            <div className="role-grid">
              {USER_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`role-card${form.role === role ? ' selected' : ''}`}
                  onClick={() => updateField('role', role)}
                >
                  <strong>{t(`auth.role.${role}`)}</strong>
                </button>
              ))}
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '...' : t('auth.register')}
            </button>
          </form>
        )}

        {error && step !== 2 && step !== 3 && step !== 4 && <p className="error">{error}</p>}

        {step > 1 && (
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setError(null);
              setStep((current) => Math.max(1, current - 1));
            }}
          >
            {t('auth.back')}
          </button>
        )}

        <p className="hint">
          {t('auth.already')} <Link to="/login" state={{ authIntro: true }}>{t('auth.login')}</Link>
        </p>
      </section>
    </main>
  );
}
