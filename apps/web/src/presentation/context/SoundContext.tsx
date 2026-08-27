import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'bitemate_sound_enabled';

type SoundContextValue = {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

function readStoredSound(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== '0';
  } catch {
    return true;
  }
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabledState] = useState(readStoredSound);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, soundEnabled ? '1' : '0');
    } catch {
      // Ignore storage failures.
    }
  }, [soundEnabled]);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
  }, []);

  const value = useMemo(
    () => ({ soundEnabled, setSoundEnabled }),
    [soundEnabled, setSoundEnabled],
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within SoundProvider');
  }
  return context;
}
