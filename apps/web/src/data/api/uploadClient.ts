import { getAccessToken, refreshSessionTokens } from '@/data/api/sessionBridge';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api';

export async function uploadMedia(
  accessToken: string,
  file: File,
): Promise<{ mediaUrl: string; thumbnailUrl: string | null; mediaType: 'IMAGE' | 'VIDEO' }> {
  const formData = new FormData();
  formData.append('file', file);

  async function send(token: string) {
    return fetch(`${API_BASE_URL}/media/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  }

  let token = accessToken || getAccessToken() || '';
  let response = await send(token);
  if (response.status === 401) {
    const next = await refreshSessionTokens(API_BASE_URL);
    if (next) {
      response = await send(next);
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      typeof body === 'object' && body && 'message' in body
        ? String((body as { message: string }).message)
        : 'Upload failed',
    );
  }

  return response.json();
}
