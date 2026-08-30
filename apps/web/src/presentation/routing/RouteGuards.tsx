import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/presentation/context/AuthContext';
import { buildAuthLoginState, AUTH_HOME_PATH } from '@/presentation/routing/authRedirect';

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
    return <Navigate to={AUTH_HOME_PATH} replace />;
  }

  return <Outlet />;
}

export function AuthGate() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={buildAuthLoginState(returnTo)} />;
  }

  return <Outlet />;
}

export function OtpGate() {
  const { isAuthenticated, isOtpVerified } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={buildAuthLoginState(returnTo)} />;
  }

  if (isOtpVerified) {
    return <Navigate to={AUTH_HOME_PATH} replace />;
  }

  return <Outlet />;
}

export function VerifiedGate() {
  const { isAuthenticated, isOtpVerified } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={buildAuthLoginState(returnTo)} />;
  }

  if (!isOtpVerified) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/verify-otp" replace state={{ returnTo }} />;
  }

  return <Outlet />;
}
