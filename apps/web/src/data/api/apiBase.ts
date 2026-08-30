/** Resolve API base URL at runtime (env, production host, or same-origin dev proxy). */
export function resolveApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
  if (fromEnv) {
    return fromEnv;
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'www.bitemate.ir' || host === 'bitemate.ir') {
      return 'https://api.bitemate.ir/api';
    }
  }

  return '/api';
}
