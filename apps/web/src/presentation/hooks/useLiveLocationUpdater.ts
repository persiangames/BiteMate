import { GPS_OPTIONS } from '@/data/geo/geocode';
import { updateLiveLocation } from '@/data/repositories/profileRepository';
import { useEffect, useRef } from 'react';

export function useLiveLocationUpdater(
  enabled: boolean,
  accessToken: string | null,
) {
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !accessToken || !navigator.geolocation) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        void updateLiveLocation(accessToken, {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }).catch(() => {
          // Ignore transient location sync errors in the background loop.
        });
      },
      () => undefined,
      GPS_OPTIONS,
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled, accessToken]);
}
