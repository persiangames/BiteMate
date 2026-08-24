import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  USER_ROLES,
  type UserRole,
} from '@bitemate/shared';
import { isFirebaseConfigured, signInWithGoogle } from '@/data/firebase/firebaseClient';
import { BrandLockup } from '@/presentation/components/brand/BrandLockup';
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
    username: '',
    fullName: '',
    phoneNumber: '',
    country: '',
    city: '',
    dateOfBirth: '',
    role: 'NORMAL_USER' as UserRole,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const totalSteps = 4;

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const countryOptions = useMemo(() => countrySelectOptions(locale), [locale]);
  const cityOptions = useMemo(() => citySelectOptions(form.country, locale), [form.country, locale]);

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

      const created = await register({
        channel: authMethod,
        email: authMethod === 'email' ? form.email : undefined,
        phoneNumber: authMethod === 'phone' ? form.phoneNumber : undefined,
        password: form.password,
        username: form.username || undefined,
        fullName: form.fullName,
        country: form.country,
        city: form.city,
        dateOfBirth: form.dateOfBirth,
        role: form.role,
        locale,
      });
      navigate(created.user.otpVerified ? '/feed' : '/verify-otp', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? t('auth.registerFailed') : t('auth.registerFailed'));
    } finally {
      setLoading(false);
    }
  }

  function nextFromProfile() {
    if (!form.fullName || !form.country || !form.city || !form.dateOfBirth) {
      setError(t('auth.completeProfile'));
      return;
    }
    setError(null);
    setStep(4);
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

  const profileFields = (
    <>
      <label className="field">
        <span>{t('auth.username')}</span>
        <input
          value={form.username}
          onChange={(event) => updateField('username', event.target.value.toLowerCase())}
          placeholder={t('auth.optional')}
        />
      </label>
      <label className="field">
        <span>{t('auth.fullName')}</span>
        <input
          value={form.fullName}
          onChange={(event) => updateField('fullName', event.target.value)}
          required
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
              setError(null);
              setStep(3);
            }}
          >
            <label className="field">
              <span>{t('auth.email')}</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>{t('auth.password')}</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                minLength={8}
                required
              />
            </label>
            <p className="hint">{t('auth.emailOtpHint')}</p>
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
              setError(null);
              setStep(3);
            }}
          >
            <label className="field">
              <span>{t('auth.phone')}</span>
              <input
                value={form.phoneNumber}
                onChange={(event) => updateField('phoneNumber', event.target.value)}
                placeholder="+989121234567"
                required
              />
            </label>
            <label className="field">
              <span>{t('auth.password')}</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                minLength={8}
                required
              />
            </label>
            <p className="hint">{t('auth.phoneOtpHint')}</p>
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
              nextFromProfile();
            }}
          >
            {profileFields}
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

        {error && step !== 4 && <p className="error">{error}</p>}

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
          {t('auth.already')} <Link to="/login">{t('auth.login')}</Link>
        </p>
      </section>
    </main>
  );
}
