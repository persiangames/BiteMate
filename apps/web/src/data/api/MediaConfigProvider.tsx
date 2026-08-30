import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { loadPublicMediaConfig, getRuntimeUploadsBaseUrl } from '@/data/api/publicConfig';

const MediaConfigContext = createContext(false);

export function useMediaConfigReady(): boolean {
  return useContext(MediaConfigContext);
}

export function MediaConfigProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(Boolean(getRuntimeUploadsBaseUrl()));

  useEffect(() => {
    void loadPublicMediaConfig().finally(() => setReady(true));
  }, []);

  return <MediaConfigContext.Provider value={ready}>{children}</MediaConfigContext.Provider>;
}
