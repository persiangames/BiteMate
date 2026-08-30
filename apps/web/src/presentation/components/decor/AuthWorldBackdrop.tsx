import { useId } from 'react';

type AuthWorldBackdropProps = {
  tone?: 'intro' | 'form';
};

/** Faint world map wallpaper for auth intro and login/signup forms. */
export function AuthWorldBackdrop({ tone = 'form' }: AuthWorldBackdropProps) {
  const rawId = useId().replace(/:/g, '');
  const gridId = `auth-world-grid-${rawId}`;

  return (
    <div className={`auth-world-backdrop auth-world-backdrop--${tone}`} aria-hidden>
      <svg className="auth-world-backdrop__svg" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id={gridId} width="100" height="100" patternUnits="userSpaceOnUse">
            <path
              d="M 100 0 L 0 0 0 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.6"
              opacity="0.35"
            />
          </pattern>
        </defs>
        <rect width="1000" height="500" fill={`url(#${gridId})`} opacity="0.45" />
        <g
          fill="currentColor"
          fillOpacity="0.14"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinejoin="round"
          opacity="0.9"
        >
          <path d="M 118 98 C 152 72 198 78 228 98 L 268 128 C 292 148 298 178 282 208 L 252 248 C 228 268 188 262 162 238 L 128 198 C 108 168 102 128 118 98 Z" />
          <path d="M 198 248 L 228 238 L 248 268 L 242 318 L 228 378 L 212 428 L 198 468 L 182 438 L 178 378 L 182 318 L 188 278 Z" />
          <path d="M 458 118 C 488 102 528 108 548 128 L 562 158 L 552 188 L 528 202 L 498 192 L 478 168 L 468 142 Z" />
          <path d="M 472 208 C 508 198 538 218 548 258 L 542 318 L 528 378 L 512 428 L 492 448 L 478 408 L 468 348 L 462 278 Z" />
          <path d="M 548 98 C 628 82 728 88 818 108 L 878 138 L 912 178 L 918 228 L 898 268 L 848 288 L 768 278 L 688 258 L 612 228 L 558 188 L 538 148 Z" />
          <path d="M 562 248 C 612 238 662 248 698 268 L 728 298 L 738 338 L 722 368 L 682 382 L 632 372 L 588 348 L 562 312 L 552 278 Z" />
          <path d="M 798 328 C 838 318 878 328 898 348 L 908 378 L 892 398 L 852 408 L 812 398 L 788 368 Z" />
          <path d="M 128 458 C 248 448 748 448 868 458 L 892 478 L 868 492 L 128 492 L 108 478 Z" opacity="0.55" />
        </g>
        <g fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.28">
          <ellipse cx="500" cy="250" rx="420" ry="198" />
          <ellipse cx="500" cy="250" rx="420" ry="132" />
          <ellipse cx="500" cy="250" rx="420" ry="66" />
          <line x1="80" y1="250" x2="920" y2="250" />
        </g>
      </svg>
    </div>
  );
}
