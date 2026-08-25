export function localizeError(
  t: (key: string, vars?: Record<string, string | number>) => string,
  err: unknown,
  fallbackKey = 'error.generic',
): string {
  const message = err instanceof Error ? err.message.trim() : '';
  const mapped: Record<string, string> = {
    'Post not found': 'error.loadFailed',
    'Username already taken': 'profile.username.taken',
    'This username is already taken': 'profile.username.taken',
    'Email or phone number already registered': 'auth.error.duplicate',
    'Registration temporarily blocked by fraud controls': 'auth.error.blocked',
    'Unable to send verification code': 'auth.otp.failed',
    'You must be at least 13 years old to sign up': 'auth.error.tooYoung',
    'Username must be 3–30 letters, numbers, or underscores': 'profile.username.invalid',
    'Phone number must be in international format, e.g. +989121234567': 'auth.error.phoneFormat',
    'Password must be 8–128 characters and include a letter, a number, and a symbol':
      'auth.password.rules',
    'Invalid email or password': 'auth.error.invalid',
  };

  if (message && mapped[message]) {
    return t(mapped[message]);
  }

  if (message && !message.startsWith('Request failed:')) {
    return message;
  }

  return t(fallbackKey);
}
