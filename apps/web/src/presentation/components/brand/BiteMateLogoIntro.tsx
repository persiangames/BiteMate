import { useEffect, useId, useRef } from 'react';
import { BrandLockup } from '@/presentation/components/brand/BrandLockup';

const INTRO_MS = 1800;

type BiteMateLogoIntroProps = {
  onComplete?: () => void;
};

function usePrefersReducedMotion(): boolean {
  const ref = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  return ref.current;
}

export function BiteMateLogoIntro({ onComplete }: BiteMateLogoIntroProps) {
  const uid = useId().replace(/:/g, '');
  const pinGradId = `bl-pin-${uid}`;
  const strokeGradId = `bl-stroke-${uid}`;
  const doneRef = useRef(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      if (!doneRef.current) {
        doneRef.current = true;
        onComplete?.();
      }
      return;
    }

    const timer = window.setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        onComplete?.();
      }
    }, INTRO_MS);

    return () => window.clearTimeout(timer);
  }, [onComplete, reducedMotion]);

  if (reducedMotion) {
    return (
      <div className="bite-logo-intro bite-logo-intro--static" aria-hidden>
        <BrandLockup size="md" />
      </div>
    );
  }

  return (
    <div className="bite-logo-intro" aria-hidden>
      <div className="bite-logo-intro__stage">
        <svg
          className="bite-logo-intro__svg"
          viewBox="0 0 200 220"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="BiteMate"
        >
          <defs>
            <linearGradient id={pinGradId} x1="100" y1="24" x2="100" y2="190" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFC107" />
              <stop offset="45%" stopColor="#FF8A00" />
              <stop offset="100%" stopColor="#FF4B3E" />
            </linearGradient>
            <linearGradient id={strokeGradId} x1="100" y1="24" x2="100" y2="190" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF8A00" />
              <stop offset="100%" stopColor="#FF4B3E" />
            </linearGradient>
          </defs>

          {/* Stage 1 — GPS pulse */}
          <circle className="bl-s1-pulse" cx="100" cy="108" r="4" fill="#FF8A00" />

          {/* Stage 2 — location pin draw + fill */}
          <path
            className="bl-s2-pin-stroke"
            d="M100 28c-26 0-47 19.5-47 43.5 0 30.5 47 76 47 76s47-45.5 47-76c0-24-21-43.5-47-43.5Z"
            fill="none"
            stroke={`url(#${strokeGradId})`}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
          />
          <path
            className="bl-s2-pin-fill"
            d="M100 28c-26 0-47 19.5-47 43.5 0 30.5 47 76 47 76s47-45.5 47-76c0-24-21-43.5-47-43.5Z"
            fill={`url(#${pinGradId})`}
          />

          {/* Stage 5 — connection ring (drawn around people) */}
          <ellipse
            className="bl-s5-ring"
            cx="100"
            cy="82"
            rx="40"
            ry="34"
            fill="none"
            stroke={`url(#${strokeGradId})`}
            strokeWidth="2.5"
            strokeLinecap="round"
            pathLength={1}
          />

          {/* Stage 3 — two people */}
          <g className="bl-s3-people">
            <circle className="bl-s3-head bl-s3-head--l" cx="82" cy="72" r="7" fill="#FF8A00" />
            <circle className="bl-s3-head bl-s3-head--r" cx="118" cy="72" r="7" fill="#FF8A00" />
            <path
              className="bl-s3-body bl-s3-body--l"
              d="M74 80c2 10 8 14 14 14"
              stroke="#3C2415"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              className="bl-s3-body bl-s3-body--r"
              d="M126 80c-2 10-8 14-14 14"
              stroke="#3C2415"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Stage 4 — cloche / dish */}
          <g className="bl-s4-cloche">
            <ellipse className="bl-s4-glow" cx="100" cy="98" rx="18" ry="6" fill="rgba(255,138,0,0.25)" />
            <ellipse cx="100" cy="98" rx="16" ry="5" fill="#fff" stroke="#FF8A00" strokeWidth="1.8" />
            <path
              d="M88 93c4 5 20 5 24 0"
              stroke="#FF4B3E"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M92 88c2-6 14-6 16 0"
              stroke="#FF8A00"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Stage 6 — fork & spoon */}
          <g className="bl-s6-fork">
            <path
              d="M22 68c-5 0-9 4-9 9v34c0 5 4 9 9 9"
              stroke="#FF8A00"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <path d="M16 72v5M16 81v5M16 90v5" stroke="#FF8A00" strokeWidth="2.2" strokeLinecap="round" />
          </g>
          <g className="bl-s6-spoon">
            <path
              d="M178 68c5 0 9 4 9 9v34c0 5-4 9-9 9"
              stroke="#FF4B3E"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <ellipse cx="178" cy="60" rx="7" ry="9" stroke="#FF4B3E" strokeWidth="2.5" fill="none" />
          </g>
        </svg>

        {/* Stage 7 — exact brand lockup (icon + wordmark + tagline) */}
        <div className="bl-s7-lockup">
          <BrandLockup size="md" />
        </div>
      </div>
    </div>
  );
}
