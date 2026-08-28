import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDirectChat } from '@/data/repositories/chatRepository';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';

type ProfileMessageButtonProps = {
  userId: string;
  className?: string;
};

export function ProfileMessageButton({ userId, className = '' }: ProfileMessageButtonProps) {
  const { accessToken, user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!accessToken || user?.id === userId) {
    return null;
  }

  async function handleClick() {
    if (!accessToken || busy) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const chat = await createDirectChat(accessToken, { userId });
      navigate(`/chats/${chat.id}`);
    } catch {
      setError(t('profile.messageFailed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`profile-message${className ? ` ${className}` : ''}`}>
      <button
        type="button"
        className="profile-message__btn"
        aria-label={t('profile.message')}
        title={t('profile.message')}
        disabled={busy}
        onClick={() => void handleClick()}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 16.8V7.8A2.3 2.3 0 0 1 7.3 5.5h9.4A2.3 2.3 0 0 1 19 7.8v6.2a2.3 2.3 0 0 1-2.3 2.3H9.2L5 19.2v-2.4Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M8.5 9.6h7M8.5 12.4h4.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      {error ? <p className="profile-message__error">{error}</p> : null}
    </div>
  );
}
