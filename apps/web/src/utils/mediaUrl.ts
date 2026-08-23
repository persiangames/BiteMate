/** Turn API/local upload URLs into a same-origin path the Vite proxy can serve. */
export function resolveMediaUrl(url?: string | null): string | undefined {
  if (!url) {
    return undefined;
  }
  if (
    url.startsWith('blob:') ||
    url.startsWith('data:') ||
    url.startsWith('/brand/')
  ) {
    return url;
  }

  try {
    const parsed = url.startsWith('http://') || url.startsWith('https://')
      ? new URL(url)
      : new URL(url, window.location.origin);
    if (parsed.pathname.startsWith('/uploads/')) {
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    return url;
  }

  return url;
}
