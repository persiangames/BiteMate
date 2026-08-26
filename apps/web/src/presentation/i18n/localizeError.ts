export function localizeError(
  t: (key: string, vars?: Record<string, string | number>) => string,
  err: unknown,
  fallbackKey = 'error.generic',
): string {
  const message = err instanceof Error ? err.message.trim() : '';
  if (message === 'Failed to fetch' || message === 'NetworkError when attempting to fetch resource.') {
    return t('auth.error.network');
  }
  const mapped: Record<string, string> = {
    'Post not found': 'error.loadFailed',
    'Username already taken': 'profile.username.taken',
    'This username is already taken': 'profile.username.taken',
    'Email or phone number already registered': 'auth.error.duplicate',
    'No account found with this email or phone number': 'auth.error.notRegistered',
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

  if (message.startsWith('Melipayamak SMS rejected:')) {
    const detail = message.replace('Melipayamak SMS rejected: ', '');
    const persian: Record<string, string> = {
      'Invalid Melipayamak username or API key': 'نام کاربری یا APIKey ملی‌پیامک اشتباه است.',
      'Insufficient Melipayamak credit': 'اعتبار پنل ملی‌پیامک کافی نیست.',
      'Invalid sender line (MELIPAYAMAK_FROM)': 'شماره خط (MELIPAYAMAK_FROM) اشتباه است.',
      'Dedicated line required; public lines cannot send via webservice':
        'خط عمومی است — خط اختصاصی لازم است.',
      'Add Render outbound IP ranges to Melipayamak allowed IPs':
        'IP سرور Render در ملی‌پیامک مجاز نیست.',
      'Use APIKey as password, not panel password':
        'به‌جای رمز پنل باید APIKey بگذاری.',
      'Recipient is on telecom blacklist': 'این شماره در لیست سیاه مخابرات است.',
      'Melipayamak account documents incomplete': 'مدارک پنل ملی‌پیامک کامل نیست.',
    };
    return persian[detail] ?? `خطای پیامک: ${detail}`;
  }
  if (message.startsWith('Melipayamak SMS is not configured')) {
    return 'تنظیمات پیامک (ملی‌پیامک) روی سرور کامل نیست.';
  }
  if (message === 'Email SMTP is not configured') {
    return 'تنظیمات ایمیل (SMTP) روی سرور کامل نیست.';
  }

  if (message && !message.startsWith('Request failed:')) {
    return message;
  }

  return t(fallbackKey);
}
