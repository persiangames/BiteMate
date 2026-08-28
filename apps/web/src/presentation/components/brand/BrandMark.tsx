import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/presentation/context/AuthContext';
import { ICON_MARK_VERSION } from '@/presentation/components/brand/icon-mark.version';

type BrandMarkProps = {
  size?: 'sm' | 'md';
  linked?: boolean;
  homeTo?: string;
};

const ICON_PX = { sm: 36, md: 40 } as const;

const AUTH_ENTRY_PATHS = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/language',
]);

export function BrandMark({ size = 'md', linked = true, homeTo }: BrandMarkProps) {
  const { pathname } = useLocation();
  const { isAuthenticated, isOtpVerified } = useAuth();
  const px = ICON_PX[size];

  let home = homeTo;
  if (!home) {
    if (AUTH_ENTRY_PATHS.has(pathname)) {
      home = '/';
    } else if (isAuthenticated && isOtpVerified) {
      home = '/profile';
    } else if (isAuthenticated) {
      home = '/verify-otp';
    } else {
      home = '/';
    }
  }

  const mark = (
    <img
      className="brand-mark__logo"
      src={`/brand/icon-mark.png?v=${ICON_MARK_VERSION}`}
      width={px}
      height={px}
      alt="BiteMate"
      decoding="async"
    />
  );

  if (!linked) {
    return <div className={`brand-mark brand-mark--${size}`}>{mark}</div>;
  }

  return (
    <Link to={home} className={`brand-mark brand-mark--${size}`} aria-label="BiteMate home">
      {mark}
    </Link>
  );
}
