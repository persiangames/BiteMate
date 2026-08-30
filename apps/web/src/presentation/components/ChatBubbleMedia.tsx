import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMessageType } from '@bitemate/shared';
import { useI18n } from '@/presentation/context/I18nContext';
import { uploadUrlCandidates } from '@/utils/mediaUrl';
import { useMediaConfigReady } from '@/data/api/MediaConfigProvider';

type ChatBubbleMediaProps = {
  type: ChatMessageType;
  mediaUrl: string;
  mediaMimeType?: string | null;
  durationSeconds?: number | null;
  label?: string;
  className?: string;
};

export function ChatBubbleMedia({
  type,
  mediaUrl,
  mediaMimeType,
  durationSeconds,
  label,
  className = 'bubble__media',
}: ChatBubbleMediaProps) {
  const { t } = useI18n();
  const mediaReady = useMediaConfigReady();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const candidates = useMemo(() => uploadUrlCandidates(mediaUrl), [mediaUrl, mediaReady]);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setIndex(0);
    setFailed(false);
  }, [mediaUrl]);

  const src = candidates[index];

  function tryNext() {
    setIndex((current) => {
      if (current + 1 < candidates.length) {
        return current + 1;
      }
      setFailed(true);
      return current;
    });
  }

  if (!src || failed) {
    return <p className="hint bubble__media-fallback">{t('chat.mediaUnavailable')}</p>;
  }

  if (type === 'IMAGE') {
    return (
      <img
        src={src}
        alt=""
        className={className}
        loading="lazy"
        decoding="async"
        onError={tryNext}
      />
    );
  }

  if (type === 'VIDEO') {
    return (
      <video
        ref={videoRef}
        src={src}
        controls
        playsInline
        preload="metadata"
        className={className}
        onError={tryNext}
      />
    );
  }

  if (type === 'VOICE') {
    return (
      <div className="bubble__voice">
        <audio
          ref={audioRef}
          src={src}
          controls
          preload="metadata"
          className="bubble__audio"
          onError={tryNext}
        >
          <source src={src} type={mediaMimeType ?? 'audio/webm'} />
        </audio>
        {durationSeconds ? (
          <span className="bubble__voice-duration">{durationSeconds}s</span>
        ) : null}
      </div>
    );
  }

  return (
    <a href={src} className="bubble__file" target="_blank" rel="noreferrer" download>
      📎 {label ?? t('chat.file')}
    </a>
  );
}
