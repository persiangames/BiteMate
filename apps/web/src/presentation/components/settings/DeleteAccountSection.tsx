import { FormEvent, useState } from 'react';
import {
  confirmAccountDeletion,
  requestAccountDeletion,
} from '@/data/repositories/profileRepository';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';
import { localizeError } from '@/presentation/i18n/localizeError';

export function DeleteAccountSection() {
  const { accessToken, user, logout } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'code'>('form');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [channel, setChannel] = useState<'email' | 'phone'>(
    user?.email ? 'email' : 'phone',
  );
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRequest(event: FormEvent) {
    event.preventDefault();
    if (!accessToken) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await requestAccountDeletion(accessToken, {
        password,
        confirmation: confirmation.toUpperCase(),
        channel,
      });
      setStep('code');
    } catch (err) {
      setError(localizeError(t, err, 'settings.delete.failed'));
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(event: FormEvent) {
    event.preventDefault();
    if (!accessToken) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await confirmAccountDeletion(accessToken, { channel, code });
      await logout();
      window.location.href = '/';
    } catch (err) {
      setError(localizeError(t, err, 'settings.delete.failed'));
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="settings-danger">
      <button type="button" className="settings-row settings-row--danger" onClick={() => setOpen((value) => !value)}>
        <strong>{t('settings.delete')}</strong>
        <span className="hint">{t('settings.delete.hint')}</span>
      </button>

      {open ? (
        <div className="settings-danger__panel flow">
          {step === 'form' ? (
            <form className="flow" onSubmit={(event) => void handleRequest(event)}>
              <label className="field">
                <span>{t('settings.delete.password')}</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                />
              </label>
              <label className="field">
                <span>{t('settings.delete.phrase')}</span>
                <input
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  placeholder="DELETE"
                  required
                />
              </label>
              <div className="field">
                <span>{t('settings.delete.channel')}</span>
                <div className="filter-row">
                  {user.email ? (
                    <button
                      type="button"
                      className={`filter-chip${channel === 'email' ? ' active' : ''}`}
                      onClick={() => setChannel('email')}
                    >
                      {user.email}
                    </button>
                  ) : null}
                  {user.phoneNumber ? (
                    <button
                      type="button"
                      className={`filter-chip${channel === 'phone' ? ' active' : ''}`}
                      onClick={() => setChannel('phone')}
                    >
                      {user.phoneNumber}
                    </button>
                  ) : null}
                </div>
              </div>
              <button type="submit" className="btn-secondary" disabled={loading}>
                {t('settings.delete.send')}
              </button>
            </form>
          ) : (
            <form className="flow" onSubmit={(event) => void handleConfirm(event)}>
              <label className="field">
                <span>{t('otp.code')}</span>
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  required
                />
              </label>
              <button type="submit" className="btn-secondary settings-danger__confirm" disabled={loading}>
                {t('settings.delete.confirm')}
              </button>
            </form>
          )}
          {error ? <p className="error">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
