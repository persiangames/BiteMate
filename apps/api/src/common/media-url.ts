/** Build a browser-ready absolute URL for a stored upload path. */
export type MediaUrlResolver = (url: string | null | undefined) => string | null;

export function resolvePublicMediaUrl(
  url: string | null | undefined,
  uploadsPublicBase: string,
  appPublicUrl?: string,
): string | null {
  const normalized = normalizeStoredMediaPath(url);
  if (!normalized) {
    return null;
  }

  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized;
  }

  if (normalized.startsWith('/brand/')) {
    const appBase = (appPublicUrl ?? '').replace(/\/$/, '');
    return appBase ? `${appBase}${normalized}` : normalized;
  }

  const uploadsBase = uploadsPublicBase.replace(/\/$/, '');
  const suffix = normalized.startsWith('/uploads/')
    ? normalized.slice('/uploads'.length)
    : normalized;

  if (uploadsBase.endsWith('/uploads') || uploadsBase.endsWith('/api/uploads')) {
    return `${uploadsBase}${suffix}`;
  }

  return `${uploadsBase}${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
}

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

  if (trimmed.startsWith('/api/uploads/')) {
    return trimmed.replace(/^\/api/, '');
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
