import { useEffect, useRef, useState } from 'react';

import { AuthWorldBackdrop } from '@/presentation/components/decor/AuthWorldBackdrop';
import { LOGO_ANIMATION_VERSION } from '@/presentation/components/brand/logo-animation.version';

const VIDEO_MP4_4K = `/brand/logo-animation-4k.mp4?v=${LOGO_ANIMATION_VERSION}`;
const VIDEO_MP4 = `/brand/logo-animation.mp4?v=${LOGO_ANIMATION_VERSION}`;
const VIDEO_WEBM = `/brand/logo-animation-alpha.webm?v=${LOGO_ANIMATION_VERSION}`;
const FADE_OUT_MS = 450;

type BiteMateLogoIntroProps = {
  onComplete?: () => void;
};

export function BiteMateLogoIntro({ onComplete }: BiteMateLogoIntroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const doneRef = useRef(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const finish = () => {
      if (doneRef.current) {
        return;
      }
      doneRef.current = true;
      onComplete?.();
    };

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      finish();
      return;
    }

    const video = videoRef.current;
    if (!video) {
      finish();
      return;
    }

    let fallbackTimer = 0;

    const beginFadeOut = () => {
      window.clearTimeout(fallbackTimer);
      setFadeOut(true);
      window.setTimeout(finish, FADE_OUT_MS);
    };

    const scheduleFallback = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        fallbackTimer = window.setTimeout(beginFadeOut, 6000);
        return;
      }
      const ms = (video.duration / video.playbackRate) * 1000 + 250;
      fallbackTimer = window.setTimeout(beginFadeOut, ms);
    };

    const onLoaded = () => {
      scheduleFallback();
    };

    const onPlaying = () => {
      const el = videoRef.current;
      if (el?.currentSrc && !el.currentSrc.includes('.webm')) {
        el.classList.add('bite-logo-intro__video--blend');
      }
    };

    const onEnded = () => {
      beginFadeOut();
    };

    video.playbackRate = 1;
    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('ended', onEnded);
    video.addEventListener('playing', onPlaying);

    if (video.readyState >= 1) {
      scheduleFallback();
    }

    void video.play().catch(() => {
      window.clearTimeout(fallbackTimer);
      finish();
    });

    return () => {
      window.clearTimeout(fallbackTimer);
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('playing', onPlaying);
    };
  }, [onComplete]);

  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className={`bite-logo-intro${fadeOut ? ' bite-logo-intro--fade-out' : ''}`}
      aria-hidden
    >
      <AuthWorldBackdrop tone="intro" />
      <div className="bite-logo-intro__video-wrap">
        <video
          ref={videoRef}
          className="bite-logo-intro__video"
          muted
          playsInline
          autoPlay
          preload="auto"
          disablePictureInPicture
        >
          <source src={VIDEO_WEBM} type="video/webm" />
          <source src={VIDEO_MP4_4K} type="video/mp4" />
          <source src={VIDEO_MP4} type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
