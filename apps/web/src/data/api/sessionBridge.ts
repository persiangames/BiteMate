import type { AuthTokensDto } from '@bitemate/shared';

type SessionBridge = {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  applyTokens: (tokens: AuthTokensDto) => void;
  clearSession: () => void;
};

let bridge: SessionBridge | null = null;
let refreshInFlight: Promise<string | null> | null = null;

export function bindSessionBridge(next: SessionBridge) {
  bridge = next;
}

export function getAccessToken() {
  return bridge?.getAccessToken() ?? null;
}

export function getRefreshToken() {
  return bridge?.getRefreshToken() ?? null;
}

export async function refreshSessionTokens(apiBaseUrl: string): Promise<string | null> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    const refreshToken = bridge?.getRefreshToken();
    if (!refreshToken || refreshToken.startsWith('demo')) {
      return null;
    }

    const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      bridge?.clearSession();
      return null;
    }

    const body = (await response.json()) as { tokens?: AuthTokensDto };
    if (!body.tokens?.accessToken) {
      return null;
    }

    bridge?.applyTokens(body.tokens);
    return body.tokens.accessToken;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}
