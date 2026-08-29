import { FormEvent, useRef, useState } from 'react';
import type { ChatMessageType } from '@bitemate/shared';
import { StickerPicker } from '@/presentation/components/StickerPicker';
import { useI18n } from '@/presentation/context/I18nContext';
import { useVoiceRecorder } from '@/presentation/hooks/useVoiceRecorder';

interface ChatInputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onUpload: (file: File, type: ChatMessageType) => void;
  disabled?: boolean;
  uploading?: boolean;
}

export function ChatInputBar({
  value,
  onChange,
  onSend,
  onUpload,
  disabled,
  uploading,
}: ChatInputBarProps) {
  const { t, locale } = useI18n();
  const voice = useVoiceRecorder();
  const [attachOpen, setAttachOpen] = useState(false);
  const [stickersOpen, setStickersOpen] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraPhotoRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLInputElement>(null);

  const busy = disabled || uploading || voice.recording;
  const canSend = value.trim().length > 0 && !busy;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSend) {
      return;
    }
    onSend();
  }

  function pickFile(input: HTMLInputElement | null, type: ChatMessageType) {
    input?.click();
    setAttachOpen(false);
  }

  async function toggleVoice() {
    if (voice.recording) {
      const file = await voice.finish();
      if (file) {
        onUpload(file, 'VOICE');
      }
      return;
    }
    await voice.start();
  }

  return (
    <form className="composer composer--thread chat-input-bar" onSubmit={handleSubmit}>
      {voice.recording ? (
        <div className="chat-input-bar__recording">
          <span className="chat-input-bar__recording-dot" aria-hidden />
          <span>{t('chat.recording', { seconds: voice.seconds })}</span>
          <button type="button" className="chat-input-bar__recording-cancel" onClick={() => voice.cancel()}>
            {t('common.cancel')}
          </button>
          <button type="button" className="chat-input-bar__recording-send" onClick={() => void toggleVoice()}>
            {t('chat.send')}
          </button>
        </div>
      ) : (
        <>
          <div className="composer__row">
            <div className="attach">
              <button
                type="button"
                className={`attach__btn chat-input-bar__plus${attachOpen ? ' is-active' : ''}`}
                aria-label={t('chat.attach')}
                disabled={busy}
                onClick={() => {
                  setAttachOpen((open) => !open);
                  setStickersOpen(false);
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </button>
              {attachOpen ? (
                <div className="attach__menu attach__menu--sheet">
                  <button type="button" onClick={() => pickFile(photoInputRef.current, 'IMAGE')}>
                    {t('chat.photo')}
                  </button>
                  <button type="button" onClick={() => pickFile(videoInputRef.current, 'VIDEO')}>
                    {t('chat.video')}
                  </button>
                  <button type="button" onClick={() => pickFile(fileInputRef.current, 'FILE')}>
                    {t('chat.file')}
                  </button>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              className={`composer__sticker-btn${stickersOpen ? ' is-active' : ''}`}
              disabled={busy}
              onClick={() => {
                setStickersOpen((open) => !open);
                setAttachOpen(false);
              }}
              aria-label={t('chat.stickers')}
            >
              😋
            </button>

            <textarea
              className="composer__input"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={t('chat.placeholder')}
              rows={1}
              dir="auto"
              lang={locale}
              enterKeyHint="send"
              maxLength={4000}
              disabled={busy}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey && canSend) {
                  event.preventDefault();
                  onSend();
                }
              }}
            />

            {canSend ? (
              <button type="submit" className="composer__send-fab" aria-label={t('chat.send')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M3.4 20.6 21 12 3.4 3.4 3 10.3 15 12 3 13.7z" fill="currentColor" />
                </svg>
              </button>
            ) : (
              <div className="chat-input-bar__actions">
                <button
                  type="button"
                  className="chat-input-bar__icon-btn"
                  aria-label={t('chat.camera')}
                  disabled={busy}
                  onClick={() => pickFile(cameraPhotoRef.current, 'IMAGE')}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="chat-input-bar__icon-btn"
                  aria-label={t('chat.recordVideo')}
                  disabled={busy}
                  onClick={() => pickFile(cameraVideoRef.current, 'VIDEO')}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <rect x="3" y="7" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M16 10.5 21 8v8l-5-2.5v-3Z" fill="currentColor" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`chat-input-bar__icon-btn chat-input-bar__mic${voice.recording ? ' is-recording' : ''}`}
                  aria-label={t('chat.voice')}
                  disabled={busy && !voice.recording}
                  onClick={() => void toggleVoice()}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {stickersOpen ? (
            <StickerPicker onPick={(sticker) => onChange(`${value}${sticker}`)} />
          ) : null}
        </>
      )}

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onUpload(file, 'IMAGE');
          event.target.value = '';
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onUpload(file, 'VIDEO');
          event.target.value = '';
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onUpload(file, 'FILE');
          event.target.value = '';
        }}
      />
      <input
        ref={cameraPhotoRef}
        type="file"
        accept="image/*"
        capture="user"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onUpload(file, 'IMAGE');
          event.target.value = '';
        }}
      />
      <input
        ref={cameraVideoRef}
        type="file"
        accept="video/*"
        capture="environment"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onUpload(file, 'VIDEO');
          event.target.value = '';
        }}
      />
    </form>
  );
}
