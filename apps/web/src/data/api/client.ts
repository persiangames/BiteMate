import { resolveApiBaseUrl } from '@/data/api/apiBase';
import { getAccessToken, refreshSessionTokens } from '@/data/api/sessionBridge';

const API_BASE_URL = resolveApiBaseUrl();

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function readBearerFromInit(init?: RequestInit): string | null {
  if (!init?.headers) {
    return null;
  }

  const headers = new Headers(init.headers);
  const auth = headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) {
    return auth.slice(7);
  }

  return null;
}

function resolveRequestToken(init?: RequestInit): string | null {
  return getAccessToken() ?? readBearerFromInit(init);
}

function mergeHeaders(init?: RequestInit, accessToken?: string | null): Headers {
  const headers = new Headers(init?.headers);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData;
  if (!isFormData && !headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return headers;
}

async function parseError(response: Response): Promise<ApiError> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = undefined;
  }

  let message = `Request failed: ${response.status} ${response.statusText}`;
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const raw = (body as { message: unknown }).message;
    if (typeof raw === 'string') {
      message = raw;
    } else if (Array.isArray(raw)) {
      message = raw.filter((item): item is string => typeof item === 'string').join(' ');
    }
  }

  return new ApiError(message, response.status, body);
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = resolveRequestToken(init);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: mergeHeaders(init, token),
  });

  if (response.status === 401 && !path.includes('/auth/refresh') && !path.includes('/auth/login')) {
    const nextToken = await refreshSessionTokens(API_BASE_URL);
    if (nextToken) {
      const retry = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: mergeHeaders(init, nextToken),
      });
      if (!retry.ok) {
        throw await parseError(retry);
      }
      if (retry.status === 204) {
        return undefined as T;
      }
      return retry.json() as Promise<T>;
    }
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function authHeaders(accessToken?: string | null): HeadersInit {
  const token = getAccessToken() ?? accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
