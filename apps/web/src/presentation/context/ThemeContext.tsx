import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { updateTheme as persistTheme } from '@/data/repositories/profileRepository';
import { useAuth } from '@/presentation/context/AuthContext';

type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
export const THEME_KEY = 'bitemate_theme';

function readStoredTheme(): ThemeMode | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }
  return null;
}

function applyThemeToDocument(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, accessToken, updateUser } = useAuth();
  const [theme, setThemeState] = useState<ThemeMode>(() => readStoredTheme() ?? 'light');
  const seededFromProfile = useRef(false);

  useEffect(() => {
    if (seededFromProfile.current) {
      return;
    }
    if (user == null) {
      return;
    }

    seededFromProfile.current = true;
    const stored = readStoredTheme();
    if (!stored && (user.themePreference === 'dark' || user.themePreference === 'light')) {
      setThemeState(user.themePreference);
    }
  }, [user]);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const setTheme = useCallback(
    (next: ThemeMode) => {
      setThemeState(next);
      applyThemeToDocument(next);

      if (!accessToken) {
        return;
      }

      void persistTheme(accessToken, next)
        .then((updated) => {
          updateUser(updated);
        })
        .catch(() => undefined);
    },
    [accessToken, updateUser],
  );

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return value;
}
