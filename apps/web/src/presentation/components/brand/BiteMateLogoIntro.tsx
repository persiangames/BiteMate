import { useEffect, useRef } from 'react';

/** Source is ~4s; played at 0.8× → ~5s on screen. */
const PLAYBACK_RATE = 0.8;
const INTRO_MS = 5000;
const VIDEO_SRC = '/brand/logo-animation.mp4';

type BiteMateLogoIntroProps = {
  onComplete?: () => void;
};

export function BiteMateLogoIntro({ onComplete }: BiteMateLogoIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const doneRef = useRef(false);

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

    video.playbackRate = PLAYBACK_RATE;
    const fallbackTimer = window.setTimeout(finish, INTRO_MS + 150);

    const onEnded = () => {
      window.clearTimeout(fallbackTimer);
      finish();
    };

    video.addEventListener('ended', onEnded);

    void video.play().catch(() => {
      window.clearTimeout(fallbackTimer);
      finish();
    });

    return () => {
      window.clearTimeout(fallbackTimer);
      video.removeEventListener('ended', onEnded);
    };
  }, [onComplete]);

  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return null;
  }

  return (
    <div className="bite-logo-intro" aria-hidden>
      <video
        ref={videoRef}
        className="bite-logo-intro__video"
        src={VIDEO_SRC}
        muted
        playsInline
        autoPlay
        preload="auto"
        disablePictureInPicture
      />
    </div>
  );
}
