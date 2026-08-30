export type AuthEntryLocationState = {
  authIntro?: boolean;
  returnTo?: string;
};

export const AUTH_HOME_PATH = '/profile';

export function sanitizeReturnTo(path: string | undefined | null): string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return AUTH_HOME_PATH;
  }

  if (
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path.startsWith('/forgot-password') ||
    path.startsWith('/reset-password') ||
    path.startsWith('/language')
  ) {
    return AUTH_HOME_PATH;
  }

  return path;
}

export function buildAuthLoginState(returnTo: string): AuthEntryLocationState {
  return {
    authIntro: true,
    returnTo: sanitizeReturnTo(returnTo),
  };
}

export function readReturnTo(state: unknown): string {
  if (!state || typeof state !== 'object' || !('returnTo' in state)) {
    return AUTH_HOME_PATH;
  }

  const value = (state as { returnTo?: unknown }).returnTo;
  return typeof value === 'string' ? sanitizeReturnTo(value) : AUTH_HOME_PATH;
}
