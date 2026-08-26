'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AdminPermission, AdminProfileDto, AuthResponseDto } from '@bitemate/shared';
import { isAdminRole } from '@bitemate/shared';
import { apiFetch, authHeaders } from './api';

const STORAGE_KEY = 'bitemate.admin.session';

interface AdminSession {
  accessToken: string;
  refreshToken: string;
  profile: AdminProfileDto;
}

interface AdminAuthContextValue {
  session: AdminSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: AdminPermission) => boolean;
  request: <T>(path: string, init?: RequestInit) => Promise<T>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function readSession(): AdminSession | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = readSession();
    if (!stored) {
      setLoading(false);
      return;
    }

    apiFetch<AdminProfileDto>('/admin/me', {
      headers: authHeaders(stored.accessToken),
    })
      .then((profile) => {
        const next = { ...stored, profile };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setSession(next);
      })
      .catch(() => {
        window.localStorage.removeItem(STORAGE_KEY);
        setSession(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback((next: AdminSession | null) => {
    setSession(next);
    if (next) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiFetch<AuthResponseDto>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: email, password }),
    });

    if (!isAdminRole(result.user.role)) {
      throw new Error('This account does not have admin access');
    }

    const profile = await apiFetch<AdminProfileDto>('/admin/me', {
      headers: authHeaders(result.tokens.accessToken),
    });

    persist({
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      profile,
    });
  }, [persist]);

  const logout = useCallback(async () => {
    const current = session;
    persist(null);
    if (current?.refreshToken) {
      try {
        await apiFetch('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: current.refreshToken }),
        });
      } catch {
        // ignore logout errors
      }
    }
  }, [persist, session]);

  const request = useCallback(
    async <T,>(path: string, init?: RequestInit): Promise<T> => {
      if (!session) {
        throw new Error('Not authenticated');
      }
      return apiFetch<T>(path, {
        ...init,
        headers: {
          ...authHeaders(session.accessToken),
          ...init?.headers,
        },
      });
    },
    [session],
  );

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      session,
      loading,
      login,
      logout,
      hasPermission: (permission) =>
        Boolean(session?.profile.permissions.includes(permission)),
      request,
    }),
    [loading, login, logout, request, session],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
