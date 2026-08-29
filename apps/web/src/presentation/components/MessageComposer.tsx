import { FormEvent, type ReactNode, useState } from 'react';
import { StickerPicker } from '@/presentation/components/StickerPicker';
import { useI18n } from '@/presentation/context/I18nContext';

interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder: string;
  disabled?: boolean;
  sendLabel?: string;
  leading?: ReactNode;
  variant?: 'default' | 'thread';
}

export function MessageComposer({
  value,
  onChange,
  onSend,
  placeholder,
  disabled,
  sendLabel,
  leading,
  variant = 'default',
}: MessageComposerProps) {
  const { t, locale } = useI18n();
  const [stickersOpen, setStickersOpen] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!value.trim() || disabled) {
      return;
    }
    onSend();
  }

  return (
    <form className={`composer${variant === 'thread' ? ' composer--thread' : ''}`} onSubmit={handleSubmit}>
      <div className="composer__row">
        {leading}
        <button
          type="button"
          className={`composer__sticker-btn${stickersOpen ? ' is-active' : ''}`}
          onClick={() => setStickersOpen((open) => !open)}
          aria-label={t('chat.stickers')}
        >
          😋
        </button>
        <textarea
          className="composer__input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={1}
          dir="auto"
          lang={locale}
          enterKeyHint="send"
          maxLength={4000}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              if (value.trim() && !disabled) {
                onSend();
              }
            }
          }}
        />
        {variant === 'thread' ? (
          <button
            type="submit"
            className="composer__send-fab"
            disabled={disabled || !value.trim()}
            aria-label={sendLabel ?? t('chat.send')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M3.4 20.6 21 12 3.4 3.4 3 10.3 15 12 3 13.7z"
                fill="currentColor"
              />
            </svg>
          </button>
        ) : (
          <button type="submit" className="btn-primary composer__send" disabled={disabled || !value.trim()}>
            {sendLabel ?? t('chat.send')}
          </button>
        )}
      </div>
      {stickersOpen ? (
        <StickerPicker onPick={(sticker) => onChange(`${value}${sticker}`)} />
      ) : null}
    </form>
  );
}
