import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { APP_LOCALES } from '@/presentation/i18n/catalogs';
import type { SupportedLocale } from '@bitemate/shared';
import {
  changePassword,
  confirmAccountDeletion,
  disableTwoFactor,
  enableTwoFactor,
  requestAccountDeletion,
  setupTwoFactor,
} from '@/data/repositories/profileRepository';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';
import { useTheme } from '@/presentation/context/ThemeContext';

export function SettingsPage() {
  const { user, accessToken, setLocale, locale, logout, updateUser } = useAuth();
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!user || !accessToken) {
    return null;
  }

  return (
    <main className="page">
      <section className="panel flow">
        <h1>{t('settings.title')}</h1>
        {message ? <p className="save-success" role="status">{message}</p> : null}
        {error ? <p className="error" role="alert">{error}</p> : null}

        <Link to="/profile/edit" className="settings-row">
          <strong>{t('settings.account')}</strong>
          <span className="hint">{t('profile.edit')}</span>
        </Link>

        <label className="field">
          <span>{t('settings.language')}</span>
          <select
            value={locale}
            onChange={(event) => void setLocale(event.target.value as SupportedLocale)}
          >
            {APP_LOCALES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name.toLowerCase()}
              </option>
            ))}
          </select>
        </label>

        <div className="field">
          <span>{t('settings.appearance')}</span>
          <div className="filter-row">
            <button
              type="button"
              className={`filter-chip${theme === 'light' ? ' active' : ''}`}
              onClick={() => setTheme('light')}
            >
              {t('settings.theme.light')}
            </button>
            <button
              type="button"
              className={`filter-chip${theme === 'dark' ? ' active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              {t('settings.theme.dark')}
            </button>
          </div>
        </div>

        <Link to="/notifications" className="settings-row">
          <strong>{t('settings.notifications')}</strong>
        </Link>
        <Link to="/profile/edit" className="settings-row">
          <strong>{t('settings.privacy')}</strong>
        </Link>

        <PasswordSection
          accessToken={accessToken}
          onDone={setMessage}
          onError={setError}
        />
        <TwoFactorSection
          accessToken={accessToken}
          enabled={Boolean(user.totpEnabled)}
          onUpdated={updateUser}
          onError={setError}
          onDone={setMessage}
        />

        <button
          type="button"
          className="btn-secondary"
          onClick={() => logout().then(() => { window.location.href = '/login'; })}
        >
          {t('settings.sessions')}
        </button>

        <DeleteAccountSection
          accessToken={accessToken}
          onError={setError}
          onDeleted={() => {
            void logout().then(() => navigate('/login', { replace: true }));
          }}
        />
      </section>
    </main>
  );
}

function PasswordSection({
  accessToken,
  onDone,
  onError,
}: {
  accessToken: string;
  onDone: (value: string) => void;
  onError: (value: string) => void;
}) {
  const { t } = useI18n();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await changePassword(accessToken, { currentPassword, newPassword });
      onDone(t('settings.password.updated'));
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      onError(err instanceof Error ? t('settings.password.failed') : t('settings.password.failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="flow settings-card" onSubmit={submit}>
      <h2>{t('settings.password')}</h2>
      <input
        type="password"
        placeholder={t('settings.delete.password')}
        value={currentPassword}
        onChange={(event) => setCurrentPassword(event.target.value)}
        required
      />
      <input
        type="password"
        placeholder={t('auth.reset.new')}
        value={newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
        minLength={8}
        required
      />
      <button type="submit" className="btn-primary" disabled={loading}>
        {t('profile.save')}
      </button>
    </form>
  );
}

function TwoFactorSection({
  accessToken,
  enabled,
  onUpdated,
  onError,
  onDone,
}: {
  accessToken: string;
  enabled: boolean;
  onUpdated: (user: Awaited<ReturnType<typeof enableTwoFactor>>) => void;
  onError: (value: string) => void;
  onDone: (value: string) => void;
}) {
  const { t } = useI18n();
  const [setup, setSetup] = useState<{ qrDataUrl: string; secret: string } | null>(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function startSetup() {
    setLoading(true);
    try {
      setSetup(await setupTwoFactor(accessToken));
    } catch (err) {
      onError(err instanceof Error ? t('settings.2fa.failed') : t('settings.2fa.failed'));
    } finally {
      setLoading(false);
    }
  }

  async function confirmEnable(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      onUpdated(await enableTwoFactor(accessToken, code));
      setSetup(null);
      setCode('');
      onDone(t('settings.2fa.enabled'));
    } catch (err) {
      onError(err instanceof Error ? t('settings.2fa.failed') : t('settings.2fa.failed'));
    } finally {
      setLoading(false);
    }
  }

  async function confirmDisable(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      onUpdated(await disableTwoFactor(accessToken, { password, code }));
      setPassword('');
      setCode('');
      onDone(t('settings.2fa.disabled'));
    } catch (err) {
      onError(err instanceof Error ? t('settings.2fa.failed') : t('settings.2fa.failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flow settings-card">
      <h2>{t('settings.2fa')}</h2>
      <p className="hint">{t('settings.2fa.hint')}</p>
      {!enabled && !setup ? (
        <button type="button" className="btn-primary" onClick={() => void startSetup()} disabled={loading}>
          {t('settings.2fa.enable')}
        </button>
      ) : null}
      {setup ? (
        <form className="flow" onSubmit={confirmEnable}>
          <p className="hint">{t('settings.2fa.scan')}</p>
          <img src={setup.qrDataUrl} alt="Google Authenticator QR" width={180} height={180} />
          <p className="hint">{setup.secret}</p>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder={t('otp.code')}
            required
          />
          <button type="submit" className="btn-primary" disabled={loading || code.length !== 6}>
            {t('settings.2fa.confirm')}
          </button>
        </form>
      ) : null}
      {enabled ? (
        <form className="flow" onSubmit={confirmDisable}>
          <input
            type="password"
            placeholder={t('settings.delete.password')}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder={t('otp.code')}
            required
          />
          <button type="submit" className="btn-secondary" disabled={loading}>
            {t('settings.2fa.disable')}
          </button>
        </form>
      ) : null}
    </section>
  );
}

function DeleteAccountSection({
  accessToken,
  onError,
  onDeleted,
}: {
  accessToken: string;
  onError: (value: string) => void;
  onDeleted: () => void;
}) {
  const { t } = useI18n();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [channel, setChannel] = useState<'email' | 'phone'>('email');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [step, setStep] = useState<'ask' | 'code'>('ask');
  const [loading, setLoading] = useState(false);

  async function sendCode(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await requestAccountDeletion(accessToken, {
        password,
        confirmation,
        channel,
      });
      setDevCode(response.devCode ?? null);
      setStep('code');
    } catch (err) {
      onError(err instanceof Error ? t('settings.delete.failed') : t('settings.delete.failed'));
    } finally {
      setLoading(false);
    }
  }

  async function confirm(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await confirmAccountDeletion(accessToken, { channel, code });
      onDeleted();
    } catch (err) {
      onError(err instanceof Error ? t('settings.delete.failed') : t('settings.delete.failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flow settings-card settings-card--danger">
      <h2>{t('settings.delete')}</h2>
      <p className="hint">{t('settings.delete.hint')}</p>
      {step === 'ask' ? (
        <form className="flow" onSubmit={sendCode}>
          <input
            type="password"
            placeholder={t('settings.delete.password')}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <input
            placeholder={t('settings.delete.phrase')}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            required
          />
          <label className="field">
            <span>{t('settings.delete.channel')}</span>
            <select value={channel} onChange={(event) => setChannel(event.target.value as 'email' | 'phone')}>
              <option value="email">{t('otp.email')}</option>
              <option value="phone">{t('otp.phone')}</option>
            </select>
          </label>
          <button type="submit" className="btn-secondary" disabled={loading}>
            {t('settings.delete.send')}
          </button>
        </form>
      ) : (
        <form className="flow" onSubmit={confirm}>
          {devCode ? <p className="hint">{t('otp.dev', { code: devCode })}</p> : null}
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder={t('otp.code')}
            required
          />
          <button type="submit" className="btn-primary" disabled={loading || code.length !== 6}>
            {t('settings.delete.confirm')}
          </button>
        </form>
      )}
    </section>
  );
}
