/** Public base for uploaded media (absolute API URL or same-origin `/uploads` in dev). */
export function uploadsPublicBase(): string {
  const explicit = import.meta.env.VITE_UPLOADS_BASE_URL?.replace(/\/$/, '');
  if (explicit) {
    return explicit;
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
  if (apiBase?.startsWith('http')) {
    if (apiBase.endsWith('/api')) {
      return `${apiBase.slice(0, -4)}/uploads`;
    }
    return `${apiBase}/uploads`;
  }

  return '/uploads';
}

function extractUploadPath(value: string): string | null {
  if (value.startsWith('/uploads/')) {
    return value;
  }
  if (value.startsWith('uploads/')) {
    return `/${value}`;
  }

  try {
    const parsed =
      value.startsWith('http://') || value.startsWith('https://')
        ? new URL(value)
        : new URL(value, 'http://local');
    if (parsed.pathname.startsWith('/uploads/')) {
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    return null;
  }

  return null;
}

function resolveUploadPath(stored: string): string {
  const uploadPath =
    extractUploadPath(stored) ??
    (!stored.includes('/') && !stored.includes('://') ? `/uploads/${stored}` : null);

  if (!uploadPath) {
    return stored;
  }

  const base = uploadsPublicBase();
  if (base.startsWith('/')) {
    return uploadPath;
  }

  return `${base}${uploadPath.slice('/uploads'.length)}`;
}

/** Resolve a stored media path/URL for use in `<img src>` / `<video src>`. */
export function resolveMediaUrl(url?: string | null): string | undefined {
  if (!url) {
    return undefined;
  }
  if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('/brand/')) {
    return url;
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url);
      if (!parsed.pathname.startsWith('/uploads/')) {
        return url;
      }
    } catch {
      return url;
    }
  }

  return resolveUploadPath(url);
}

/** Store relative upload paths so media survives host changes in dev/prod. */
export function normalizeMediaUrlForStorage(url: string): string {
  const uploadPath = extractUploadPath(url);
  if (uploadPath) {
    return uploadPath;
  }

  if (!url.includes('/') && !url.includes('://')) {
    return `/uploads/${url}`;
  }

  return url;
}
