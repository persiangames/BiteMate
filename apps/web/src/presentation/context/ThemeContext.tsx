import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { updateTheme as persistTheme } from '@/data/repositories/profileRepository';
import { useAuth } from '@/presentation/context/AuthContext';

type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const THEME_KEY = 'bitemate_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, accessToken } = useAuth();
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    return 'light';
  });

  useEffect(() => {
    if (user?.themePreference === 'dark' || user?.themePreference === 'light') {
      setThemeState(user.themePreference);
    }
  }, [user?.themePreference]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const setTheme = (next: ThemeMode) => {
    setThemeState(next);
    if (accessToken) {
      void persistTheme(accessToken, next).catch(() => undefined);
    }
  };

  const value = useMemo(() => ({ theme, setTheme }), [theme, accessToken]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return value;
}
