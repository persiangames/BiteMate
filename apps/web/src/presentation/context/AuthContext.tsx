import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthResponseDto, AuthUserDto, SupportedLocale } from '@bitemate/shared';
import {
  firebaseLogin,
  loginUser,
  logoutUser,
  registerUser,
  updateLocale,
  verifyOtp,
} from '@/data/repositories/authRepository';
import { createDemoAdminSession, isDemoAccessToken, isDemoAdminLogin } from '@/data/demo/demoSession';
import { bindSessionBridge } from '@/data/api/sessionBridge';
import { isAppLocale } from '@/presentation/i18n/catalogs';

const STORAGE_KEY = 'bitemate_auth_session';
const LOCALE_KEY = 'bitemate_locale';
const ONBOARDING_KEY = 'bitemate_language_selected';

interface AuthSession {
  user: AuthUserDto;
  accessToken: string;
  refreshToken: string;
}

interface AuthContextValue {
  user: AuthUserDto | null;
  accessToken: string | null;
  locale: SupportedLocale;
  isAuthenticated: boolean;
  isOtpVerified: boolean;
  hasSelectedLanguage: boolean;
  setLocale: (locale: SupportedLocale) => Promise<void>;
  markLanguageSelected: () => void;
  login: (identifier: string, password: string) => Promise<AuthResponseDto>;
  register: (payload: Parameters<typeof registerUser>[0]) => Promise<AuthResponseDto>;
  socialLogin: (payload: Parameters<typeof firebaseLogin>[0]) => Promise<AuthResponseDto>;
  completeOtp: (destination: string, code: string) => Promise<AuthResponseDto>;
  logout: () => Promise<void>;
  setSession: (session: AuthResponseDto) => void;
  updateUser: (user: AuthUserDto) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeUser(user: AuthUserDto): AuthUserDto {
  return {
    ...user,
    preferredMeals: user.preferredMeals ?? [],
    favoriteCuisines: user.favoriteCuisines ?? [],
    favoriteFoods: user.favoriteFoods ?? [],
    lookingToEat: user.lookingToEat ?? false,
    gender: user.gender ?? null,
    education: user.education ?? null,
    followerCount: user.followerCount ?? 0,
    followingCount: user.followingCount ?? 0,
  };
}

function readStoredSession(): AuthSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    return { ...parsed, user: normalizeUser(parsed.user) };
  } catch {
    return null;
  }
}

function persistSession(session: AuthSession | null): void {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function readStoredLocale(): SupportedLocale | null {
  const stored = localStorage.getItem(LOCALE_KEY);
  return isAppLocale(stored) ? stored : null;
}

function writeStoredLocale(locale: SupportedLocale) {
  localStorage.setItem(LOCALE_KEY, locale);
}

function preferredLocale(userLocale?: string | null): SupportedLocale {
  return readStoredLocale() ?? (isAppLocale(userLocale) ? userLocale : 'en');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(() =>
    readStoredSession(),
  );
  const [locale, setLocaleState] = useState<SupportedLocale>(() =>
    preferredLocale(readStoredSession()?.user.locale),
  );
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) === 'true',
  );

  const setSession = useCallback((response: AuthResponseDto) => {
    const nextLocale = preferredLocale(response.user.locale);
    const nextUser = { ...normalizeUser(response.user), locale: nextLocale };
    const nextSession: AuthSession = {
      user: nextUser,
      accessToken: response.tokens.accessToken,
      refreshToken: response.tokens.refreshToken,
    };
    setSessionState(nextSession);
    persistSession(nextSession);
    setLocaleState(nextLocale);
    writeStoredLocale(nextLocale);

    if (
      response.tokens.accessToken &&
      response.user.locale !== nextLocale
    ) {
      void updateLocale(response.tokens.accessToken, nextLocale)
        .then((user) => {
          setSessionState((current) => {
            if (!current) {
              return current;
            }
            const synced = { ...current, user: { ...user, locale: nextLocale } };
            persistSession(synced);
            return synced;
          });
        })
        .catch(() => undefined);
    }
  }, []);

  const updateUser = useCallback((user: AuthUserDto) => {
    setSessionState((current) => {
      if (!current) {
        return current;
      }

      const nextSession = { ...current, user: normalizeUser(user) };
      persistSession(nextSession);
      return nextSession;
    });
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    if (isDemoAdminLogin(identifier, password)) {
      const response = createDemoAdminSession(locale);
      localStorage.setItem(ONBOARDING_KEY, 'true');
      setHasSelectedLanguage(true);
      setSession(response);
      return response;
    }

    const response = await loginUser({ identifier, password, locale });
    if (!response.twoFactorRequired) {
      setSession(response);
    }
    return response;
  }, [locale, setSession]);

  const register = useCallback(
    async (payload: Parameters<typeof registerUser>[0]) => {
      const response = await registerUser(payload);
      setSession(response);
      return response;
    },
    [setSession],
  );

  const socialLogin = useCallback(
    async (payload: Parameters<typeof firebaseLogin>[0]) => {
      const response = await firebaseLogin(payload);
      setSession(response);
      return response;
    },
    [setSession],
  );

  const completeOtp = useCallback(
    async (destination: string, code: string) => {
      if (!session?.accessToken) {
        throw new Error('Not authenticated');
      }

      const response = await verifyOtp(
        session.accessToken,
        destination.includes('@')
          ? { email: destination, code }
          : { phoneNumber: destination, code },
      );
      setSession(response);
      return response;
    },
    [session?.accessToken, setSession],
  );

  const logout = useCallback(async () => {
    if (session?.refreshToken && !isDemoAccessToken(session.accessToken)) {
      try {
        await logoutUser(session.refreshToken);
      } catch {
        // Ignore logout API errors locally.
      }
    }

    setSessionState(null);
    persistSession(null);
  }, [session?.accessToken, session?.refreshToken]);

  const setLocale = useCallback(
    async (nextLocale: SupportedLocale) => {
      setLocaleState(nextLocale);
      writeStoredLocale(nextLocale);

      if (session?.accessToken) {
        try {
          const user = await updateLocale(session.accessToken, nextLocale);
          setSessionState({
            ...session,
            user: user as AuthUserDto,
          });
          persistSession({ ...session, user: user as AuthUserDto });
        } catch {
          // Keep local locale even if API update fails before login.
        }
      }
    },
    [session],
  );

  const markLanguageSelected = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setHasSelectedLanguage(true);
  }, []);

  useEffect(() => {
    bindSessionBridge({
      getAccessToken: () => session?.accessToken ?? null,
      getRefreshToken: () => session?.refreshToken ?? null,
      applyTokens: (tokens) => {
        setSessionState((current) => {
          if (!current) {
            return current;
          }
          const nextSession = {
            ...current,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          };
          persistSession(nextSession);
          return nextSession;
        });
      },
      clearSession: () => {
        setSessionState(null);
        persistSession(null);
      },
    });
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      locale,
      isAuthenticated: Boolean(session),
      isOtpVerified: Boolean(session?.user.otpVerified),
      hasSelectedLanguage,
      setLocale,
      markLanguageSelected,
      login,
      register,
      socialLogin,
      completeOtp,
      logout,
      setSession,
      updateUser,
    }),
    [
      session,
      locale,
      hasSelectedLanguage,
      setLocale,
      markLanguageSelected,
      login,
      register,
      socialLogin,
      completeOtp,
      logout,
      setSession,
      updateUser,
    ],
  );

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = ['fa', 'ar'].includes(locale) ? 'rtl' : 'ltr';
  }, [locale]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
