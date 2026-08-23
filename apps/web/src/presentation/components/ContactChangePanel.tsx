import { FormEvent, useState } from 'react';
import {
  requestContactChange,
  verifyContactChange,
} from '@/data/repositories/profileRepository';
import type { AuthUserDto, ContactChangeChannel } from '@bitemate/shared';
import { SaveFeedback } from '@/presentation/components/SaveFeedback';
import { useI18n } from '@/presentation/context/I18nContext';
import { localizeError } from '@/presentation/i18n/localizeError';

type ContactChangePanelProps = {
  accessToken: string;
  email: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  onUpdated: (user: AuthUserDto) => void;
};

export function ContactChangePanel({
  accessToken,
  email,
  phoneNumber,
  emailVerified,
  phoneVerified,
  onUpdated,
}: ContactChangePanelProps) {
  const { t } = useI18n();
  return (
    <div className="contact-change flow">
      <ContactRow
        accessToken={accessToken}
        channel="email"
        label={t('auth.email')}
        currentValue={email}
        verified={emailVerified}
        placeholder="you@email.com"
        onUpdated={onUpdated}
      />
      <ContactRow
        accessToken={accessToken}
        channel="phone"
        label={t('otp.phone')}
        currentValue={phoneNumber}
        verified={phoneVerified}
        placeholder="+989121234567"
        onUpdated={onUpdated}
      />
    </div>
  );
}

function ContactRow({
  accessToken,
  channel,
  label,
  currentValue,
  verified,
  placeholder,
  onUpdated,
}: {
  accessToken: string;
  channel: ContactChangeChannel;
  label: string;
  currentValue: string | null;
  verified: boolean;
  placeholder: string;
  onUpdated: (user: AuthUserDto) => void;
}) {
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentValue ?? '');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'edit' | 'code'>('edit');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function sendCode(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const response = await requestContactChange(accessToken, { channel, value });
      setDevCode(response.devCode ?? null);
      setStep('code');
    } catch (err) {
      setError(localizeError(t, err, 'contact.failed'));
    } finally {
      setLoading(false);
    }
  }

  async function confirmCode(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const user = await verifyContactChange(accessToken, { channel, value, code });
      onUpdated(user);
      setEditing(false);
      setStep('edit');
      setCode('');
      setDevCode(null);
      setSaved(true);
    } catch (err) {
      setError(localizeError(t, err, 'contact.failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="contact-row">
      <div className="contact-row__head">
        <div>
          <strong>{label}</strong>
          <p className="hint">
            {currentValue || t('contact.notSet')}
            {currentValue ? ` · ${verified ? t('contact.verified') : t('contact.unverified')}` : ''}
          </p>
        </div>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            setEditing((open) => !open);
            setStep('edit');
            setError(null);
            setSaved(false);
            setValue(currentValue ?? '');
            setCode('');
            setDevCode(null);
          }}
        >
          {editing ? t('common.cancel') : t('contact.change')}
        </button>
      </div>

      {editing && step === 'edit' ? (
        <form className="flow" onSubmit={sendCode}>
          <label className="field">
            <span>{t('contact.new', { label })}</span>
            <input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={placeholder}
              required
              type={channel === 'email' ? 'email' : 'tel'}
            />
          </label>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t('contact.sending') : t('contact.send')}
          </button>
        </form>
      ) : null}

      {editing && step === 'code' ? (
        <form className="flow" onSubmit={confirmCode}>
          <p className="hint">{t('contact.codeHint', { value })}</p>
          {devCode ? <p className="hint">{t('otp.dev', { code: devCode })}</p> : null}
          <label className="field">
            <span>{t('otp.code')}</span>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              required
            />
          </label>
          <div className="crop-modal__actions">
            <button type="button" className="btn-secondary" onClick={() => setStep('edit')}>
              {t('contact.change')}
            </button>
            <button type="submit" className="btn-primary" disabled={loading || code.length !== 6}>
              {loading ? t('contact.checking') : t('contact.verify')}
            </button>
          </div>
        </form>
      ) : null}

      <SaveFeedback saved={saved} error={error} successKey="contact.saved" />
    </div>
  );
}
