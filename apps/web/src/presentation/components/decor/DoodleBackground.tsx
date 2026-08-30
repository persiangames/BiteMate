type DoodleBackgroundProps = {
  variant?: 'default' | 'intro';
};

/** Telegram-style doodle wallpaper for auth and app chrome. */
export function DoodleBackground({ variant = 'default' }: DoodleBackgroundProps) {
  const isIntro = variant === 'intro';

  return (
    <div className={`doodle-bg${isIntro ? ' doodle-bg--intro' : ''}`} aria-hidden>
      <svg className="doodle-bg__svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="bitemate-doodle" width="280" height="280" patternUnits="userSpaceOnUse">
            <g stroke="currentColor" strokeWidth="1.35" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={isIntro ? '0.78' : '0.55'}>
              <g transform="translate(18 22)">
                <ellipse cx="22" cy="28" rx="18" ry="10" />
                <circle cx="14" cy="14" r="3" />
                <circle cx="30" cy="14" r="3" />
                <path d="M10 20h24" />
              </g>
              <g transform="translate(150 18)">
                <rect x="8" y="16" width="28" height="18" rx="3" />
                <path d="M12 34v6M32 34v6" />
                <circle cx="16" cy="10" r="3" />
                <circle cx="28" cy="10" r="3" />
              </g>
              <g transform="translate(88 120)">
                <path d="M6 30c8-10 18-10 26 0" />
                <circle cx="10" cy="16" r="3" />
                <circle cx="28" cy="16" r="3" />
                <path d="M4 24h32" />
              </g>
              <g transform="translate(200 110)">
                <rect x="4" y="8" width="20" height="14" rx="2" />
                <path d="M8 22v8M20 22v8" />
                <circle cx="14" cy="4" r="2.5" />
              </g>
              <g transform="translate(40 150)">
                <path d="M4 28c6-8 14-8 20 0" />
                <path d="M14 8v12M10 12h8" />
              </g>
              <g transform="translate(170 190)">
                <circle cx="16" cy="16" r="12" />
                <path d="M10 16h12M16 10v12" />
              </g>
              <g transform="translate(230 40)">
                <path d="M4 20c4-6 10-6 14 0M4 26c4 6 10 6 14 0" />
                <circle cx="11" cy="10" r="2.5" />
              </g>
              <g transform="translate(110 210)">
                <path d="M8 26l8-16 8 16z" />
                <path d="M12 22h8" />
              </g>
              <g transform="translate(20 210)">
                <rect x="6" y="10" width="24" height="16" rx="2" />
                <path d="M10 26v6M26 26v6" />
              </g>
              {isIntro ? (
                <>
                  <g transform="translate(118 24)">
                    <circle cx="14" cy="14" r="10" />
                    <path d="M6 14h16M14 6v16" />
                  </g>
                  <g transform="translate(228 168)">
                    <path d="M4 20c5-8 11-8 16 0" />
                    <circle cx="6" cy="10" r="2.5" />
                    <circle cx="18" cy="10" r="2.5" />
                    <path d="M2 16h20" />
                  </g>
                  <g transform="translate(52 78)">
                    <path d="M8 24l4-14 4 14z" />
                    <path d="M6 24h12" />
                  </g>
                  <g transform="translate(196 228)">
                    <path d="M6 22c4-6 10-6 14 0" />
                    <path d="M8 10l6 4-6 4z" />
                  </g>
                  <g transform="translate(248 118)">
                    <rect x="4" y="8" width="18" height="12" rx="2" />
                    <path d="M8 20v6M18 20v6" />
                    <circle cx="13" cy="4" r="2" />
                  </g>
                  <g transform="translate(8 118)">
                    <path d="M6 18c3-4 9-4 12 0" />
                    <path d="M4 14c2-2 5-2 7 0M17 14c2-2 5-2 7 0" />
                  </g>
                </>
              ) : null}
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bitemate-doodle)" />
      </svg>
    </div>
  );
}
