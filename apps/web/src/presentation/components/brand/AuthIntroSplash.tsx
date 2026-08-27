import { useEffect, useState } from 'react';

type AuthIntroSplashProps = {
  onDone: () => void;
};

export function AuthIntroSplash({ onDone }: AuthIntroSplashProps) {
  const [phase, setPhase] = useState<'play' | 'exit'>('play');

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setPhase('exit'), 2100);
    const doneTimer = window.setTimeout(onDone, 2600);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div className={`auth-intro ${phase === 'exit' ? 'auth-intro--exit' : ''}`} aria-hidden>
      <div className="auth-intro__stage">
        <svg className="auth-intro__logo" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="authPinGrad" x1="100" y1="20" x2="100" y2="190" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF8A00" />
              <stop offset="1" stopColor="#FF4B3E" />
            </linearGradient>
          </defs>
          <g className="auth-intro__people">
            <circle cx="82" cy="78" r="8" fill="#3C2415" />
            <circle cx="118" cy="78" r="8" fill="#3C2415" />
            <path d="M72 98c6 8 16 8 22 0" stroke="#3C2415" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
          <g className="auth-intro__plate">
            <ellipse cx="100" cy="118" rx="34" ry="14" fill="#fff" stroke="#FF8A00" strokeWidth="2.5" />
            <path d="M88 112c4 4 20 4 24 0" stroke="#FF4B3E" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
          <path
            className="auth-intro__pin"
            d="M100 24c-28 0-50 21-50 47 0 33 50 82 50 82s50-49 50-82c0-26-22-47-50-47Z"
            fill="url(#authPinGrad)"
          />
          <g className="auth-intro__fork">
            <path d="M18 70c-6 0-10 5-10 11v36c0 6 4 11 10 11" stroke="#FF8A00" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M12 74v6M12 84v6M12 94v6" stroke="#FF8A00" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          <g className="auth-intro__spoon">
            <path d="M182 70c6 0 10 5 10 11v36c0 6-4 11-10 11" stroke="#FF4B3E" strokeWidth="4" strokeLinecap="round" fill="none" />
            <ellipse cx="182" cy="62" rx="8" ry="10" stroke="#FF4B3E" strokeWidth="3" fill="none" />
          </g>
        </svg>
        <p className="auth-intro__tagline">BiteMate</p>
      </div>
    </div>
  );
}
