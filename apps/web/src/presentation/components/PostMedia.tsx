import { useEffect, useMemo, useRef, useState } from 'react';
import type { MediaType } from '@bitemate/shared';
import { useI18n } from '@/presentation/context/I18nContext';
import { uploadUrlCandidates } from '@/utils/mediaUrl';
import { useMediaConfigReady } from '@/data/api/MediaConfigProvider';

type PostMediaProps = {
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  alt?: string;
  className?: string;
  priority?: boolean;
};

export function PostMedia({
  mediaType,
  mediaUrl,
  thumbnailUrl,
  alt = '',
  className = 'post-media',
  priority = false,
}: PostMediaProps) {
  const { t } = useI18n();
  const mediaReady = useMediaConfigReady();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaCandidates = useMemo(() => uploadUrlCandidates(mediaUrl), [mediaUrl, mediaReady]);
  const posterCandidates = useMemo(() => uploadUrlCandidates(thumbnailUrl), [thumbnailUrl, mediaReady]);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);

  useEffect(() => {
    setMediaIndex(0);
    setVideoReady(false);
    setVideoMuted(true);
  }, [mediaUrl]);

  const mediaSrc = mediaCandidates[mediaIndex];
  const posterSrc = posterCandidates[0];

  function tryNextMedia() {
    setMediaIndex((current) => (current + 1 < mediaCandidates.length ? current + 1 : current));
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video || mediaType !== 'VIDEO' || !mediaSrc) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: 0.6 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [mediaSrc, mediaType]);

  if (!mediaSrc) {
    return <div className={`${className} post-media--missing`} aria-hidden />;
  }

  if (mediaType === 'IMAGE') {
    return (
      <div className="post-media-frame">
        <img
          src={mediaSrc}
          alt={alt}
          className={className}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onError={tryNextMedia}
        />
      </div>
    );
  }

  return (
    <div className="post-media-frame post-media-frame--video">
      <video
        ref={videoRef}
        src={mediaSrc}
        poster={posterSrc}
        muted={videoMuted}
        loop
        playsInline
        preload="metadata"
        className={className}
        onLoadedData={() => setVideoReady(true)}
        onError={tryNextMedia}
        onClick={() => {
          const video = videoRef.current;
          if (!video) {
            return;
          }
          if (video.paused) {
            void video.play().catch(() => undefined);
          } else {
            video.pause();
          }
        }}
      />
      {!videoReady && posterSrc ? (
        <img src={posterSrc} alt="" className="post-media__poster" aria-hidden />
      ) : null}
      <button
        type="button"
        className="post-media__sound"
        aria-label={videoMuted ? 'Unmute video' : 'Mute video'}
        onClick={(event) => {
          event.stopPropagation();
          const video = videoRef.current;
          if (!video) {
            return;
          }
          const next = !videoMuted;
          video.muted = next;
          setVideoMuted(next);
          void video.play().catch(() => undefined);
        }}
      >
        {videoMuted ? t('post.unmute') : t('post.mute')}
      </button>
    </div>
  );
}
