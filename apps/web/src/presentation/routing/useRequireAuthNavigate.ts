import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/presentation/context/AuthContext';
import { buildAuthLoginState, sanitizeReturnTo } from '@/presentation/routing/authRedirect';

export function useRequireAuthNavigate() {
  const navigate = useNavigate();
  const { isAuthenticated, isOtpVerified } = useAuth();

  return useCallback(
    (returnTo: string): boolean => {
      const target = sanitizeReturnTo(returnTo);

      if (!isAuthenticated) {
        navigate('/login', { state: buildAuthLoginState(target) });
        return false;
      }

      if (!isOtpVerified) {
        navigate('/verify-otp', { state: { returnTo: target } });
        return false;
      }

      return true;
    },
    [isAuthenticated, isOtpVerified, navigate],
  );
}
