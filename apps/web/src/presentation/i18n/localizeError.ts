export function localizeError(
  t: (key: string, vars?: Record<string, string | number>) => string,
  err: unknown,
  fallbackKey = 'error.generic',
): string {
  const message = err instanceof Error ? err.message : '';
  const mapped: Record<string, string> = {
    'Post not found': 'error.loadFailed',
    'Username already taken': 'profile.username.taken',
    'This username is already taken': 'profile.username.taken',
  };

  if (message && mapped[message]) {
    return t(mapped[message]);
  }

  return t(fallbackKey);
}
