import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/presentation/context/AuthContext';

export function LanguageGate() {
  const { hasSelectedLanguage } = useAuth();

  if (!hasSelectedLanguage) {
    return <Navigate to="/language" replace />;
  }

  return <Outlet />;
}

export function GuestGate() {
  const { isAuthenticated, isOtpVerified } = useAuth();

  if (isAuthenticated && !isOtpVerified) {
    return <Navigate to="/verify-otp" replace />;
  }

  if (isAuthenticated && isOtpVerified) {
    return <Navigate to="/feed" replace />;
  }

  return <Outlet />;
}

export function AuthGate() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function OtpGate() {
  const { isAuthenticated, isOtpVerified } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isOtpVerified) {
    return <Navigate to="/feed" replace />;
  }

  return <Outlet />;
}

export function VerifiedGate() {
  const { isAuthenticated, isOtpVerified } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isOtpVerified) {
    return <Navigate to="/verify-otp" replace />;
  }

  return <Outlet />;
}
