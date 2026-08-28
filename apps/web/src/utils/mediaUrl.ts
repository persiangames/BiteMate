/** Public base for uploaded media (absolute API URL or same-origin `/api/uploads` in dev). */
export function uploadsPublicBase(): string {
  const explicit = import.meta.env.VITE_UPLOADS_BASE_URL?.replace(/\/$/, '');
  if (explicit) {
    return explicit;
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
  if (apiBase?.startsWith('http')) {
    return `${apiBase}/uploads`;
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/uploads`;
  }

  return '/api/uploads';
}

function uploadFileSuffix(uploadPath: string): string {
  return uploadPath.slice('/uploads'.length);
}

export function uploadUrlCandidates(stored: string | null | undefined): string[] {
  if (!stored) {
    return [];
  }

  const trimmed = stored.trim();
  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:') || trimmed.startsWith('/brand/')) {
    return [trimmed];
  }

  const candidates: string[] = [];
  const seen = new Set<string>();

  function add(url: string | undefined) {
    if (!url || seen.has(url)) {
      return;
    }
    seen.add(url);
    candidates.push(url);
  }

  const uploadPath = extractUploadPath(trimmed);
  if (uploadPath) {
    const suffix = uploadFileSuffix(uploadPath);
    const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');

    if (apiBase?.startsWith('http')) {
      add(`${apiBase}/uploads${suffix}`);
      if (apiBase.endsWith('/api')) {
        add(`${apiBase.slice(0, -4)}/uploads${suffix}`);
      }
    }

    if (typeof window !== 'undefined') {
      add(`${window.location.origin}/api/uploads${suffix}`);
      add(`${window.location.origin}/uploads${suffix}`);
    }

    add(`${uploadsPublicBase()}${suffix}`);
    add(resolveUploadPath(trimmed));
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    add(trimmed);
  }

  add(resolveUploadPath(trimmed));

  return candidates;
}

function extractUploadPath(value: string): string | null {
  if (value.startsWith('/uploads/')) {
    return value;
  }
  if (value.startsWith('/api/uploads/')) {
    return value.replace(/^\/api/, '');
  }
  if (value.startsWith('uploads/')) {
    return `/${value}`;
  }
  if (value.startsWith('api/uploads/')) {
    return `/${value.replace(/^api\//, '')}`;
  }

  try {
    const parsed =
      value.startsWith('http://') || value.startsWith('https://')
        ? new URL(value)
        : new URL(value, 'http://local');
    if (parsed.pathname.startsWith('/api/uploads/')) {
      return parsed.pathname.replace(/^\/api/, '');
    }
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

  return `${uploadsPublicBase()}${uploadFileSuffix(uploadPath)}`;
}

/** Resolve a stored media path/URL for use in `<img src>` / `<video src>`. */
export function resolveMediaUrl(url?: string | null): string | undefined {
  const candidates = uploadUrlCandidates(url);
  return candidates[0];
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
