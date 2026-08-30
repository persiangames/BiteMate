export type AuthEntryLocationState = {
  authIntro?: boolean;
  returnTo?: string;
};

export function sanitizeReturnTo(path: string | undefined | null): string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return '/feed';
  }

  if (
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path.startsWith('/forgot-password') ||
    path.startsWith('/reset-password') ||
    path.startsWith('/language')
  ) {
    return '/feed';
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
    return '/feed';
  }

  const value = (state as { returnTo?: unknown }).returnTo;
  return typeof value === 'string' ? sanitizeReturnTo(value) : '/feed';
}
