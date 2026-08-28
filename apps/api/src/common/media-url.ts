/** Store and return upload paths as `/uploads/...` regardless of legacy host prefixes. */
export function normalizeStoredMediaPath(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith('/uploads/')) {
    return trimmed;
  }

  if (trimmed.startsWith('uploads/')) {
    return `/${trimmed}`;
  }

  try {
    const parsed =
      trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? new URL(trimmed)
        : new URL(trimmed, 'http://local');
    if (parsed.pathname.startsWith('/uploads/')) {
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    // Fall through.
  }

  if (!trimmed.includes('/') && !trimmed.includes('://')) {
    return `/uploads/${trimmed}`;
  }

  return trimmed;
}
