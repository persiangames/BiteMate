import { Link } from 'react-router-dom';
import { useAuth } from '@/presentation/context/AuthContext';

type BrandMarkProps = {
  size?: 'sm' | 'md';
  linked?: boolean;
};

const ICON_PX = { sm: 36, md: 40 } as const;

export function BrandMark({ size = 'md', linked = true }: BrandMarkProps) {
  const { isAuthenticated, isOtpVerified } = useAuth();
  const px = ICON_PX[size];
  const home =
    isAuthenticated && isOtpVerified ? '/feed' : isAuthenticated ? '/verify-otp' : '/login';

  const mark = (
    <img
      className="brand-mark__logo"
      src="/brand/icon-64.png"
      srcSet="/brand/icon-32.png 1x, /brand/icon-64.png 2x, /brand/icon-96.png 3x"
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
