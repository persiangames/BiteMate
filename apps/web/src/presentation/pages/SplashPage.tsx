import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandLockup } from '@/presentation/components/brand/BrandLockup';
import { useAuth } from '@/presentation/context/AuthContext';

export function SplashPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isOtpVerified } = useAuth();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
        return;
      }
      if (!isOtpVerified) {
        navigate('/verify-otp', { replace: true });
        return;
      }
      navigate('/profile', { replace: true });
    }, 1600);

    return () => window.clearTimeout(timer);
  }, [isAuthenticated, isOtpVerified, navigate]);

  return (
    <main className="splash-screen">
      <BrandLockup size="xl" />
    </main>
  );
}
