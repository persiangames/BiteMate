import { resolveApiBaseUrl } from '@/data/api/apiBase';

const API_BASE_URL = resolveApiBaseUrl();

let uploadsBaseUrl: string | null = null;
let loadPromise: Promise<string | null> | null = null;

export function getRuntimeUploadsBaseUrl(): string | null {
  return uploadsBaseUrl;
}

export async function loadPublicMediaConfig(): Promise<string | null> {
  if (uploadsBaseUrl) {
    return uploadsBaseUrl;
  }

  if (!loadPromise) {
    loadPromise = fetch(`${API_BASE_URL}/media/public-config`)
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }
        const body = (await response.json()) as { uploadsBaseUrl?: unknown };
        if (typeof body.uploadsBaseUrl === 'string' && body.uploadsBaseUrl.trim()) {
          uploadsBaseUrl = body.uploadsBaseUrl.replace(/\/$/, '');
          return uploadsBaseUrl;
        }
        return null;
      })
      .catch(() => null);
  }

  return loadPromise;
}
