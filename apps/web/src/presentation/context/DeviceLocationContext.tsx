import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { GPS_OPTIONS, gpsErrorKey, type GpsFix } from '@/data/geo/geocode';
import { updateLiveLocation } from '@/data/repositories/profileRepository';
import { useAuth } from '@/presentation/context/AuthContext';

type GpsPermission = 'prompt' | 'granted' | 'denied' | 'unavailable';

type DeviceLocationValue = {
  fix: GpsFix | null;
  error: string | null;
  permission: GpsPermission;
  connecting: boolean;
  refresh: () => void;
};

const DeviceLocationContext = createContext<DeviceLocationValue | null>(null);

function gpsErrorMessage(code: number): string {
  return gpsErrorKey(code);
}

export function DeviceLocationProvider({ children }: { children: ReactNode }) {
  const { user, accessToken } = useAuth();
  const [fix, setFix] = useState<GpsFix | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<GpsPermission>(
    navigator.geolocation ? 'prompt' : 'unavailable',
  );
  const [connecting, setConnecting] = useState(Boolean(navigator.geolocation));
  const lastPostedAt = useRef(0);
  const accessTokenRef = useRef(accessToken);
  const shareLiveRef = useRef(Boolean(user?.liveLocationEnabled && !user?.invisibleMode && accessToken));

  accessTokenRef.current = accessToken;
  shareLiveRef.current = Boolean(user?.liveLocationEnabled && !user?.invisibleMode && accessToken);

  function applyPosition(position: GeolocationPosition) {
    const next: GpsFix = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
    };
    setFix(next);
    setPermission('granted');
    setError(null);
    setConnecting(false);

    const token = accessTokenRef.current;
    if (!shareLiveRef.current || !token) {
      return;
    }
    const now = Date.now();
    if (now - lastPostedAt.current < 8000) {
      return;
    }
    lastPostedAt.current = now;
    void updateLiveLocation(token, {
      latitude: next.latitude,
      longitude: next.longitude,
    }).catch(() => undefined);
  }

  function applyError(err: GeolocationPositionError) {
    setConnecting(false);
    setPermission(err.code === 1 ? 'denied' : 'prompt');
    setError(gpsErrorMessage(err.code));
  }

  function refresh() {
    if (!navigator.geolocation) {
      setPermission('unavailable');
      setError('gps.unsupported');
      setConnecting(false);
      return;
    }
    setConnecting(true);
    navigator.geolocation.getCurrentPosition(applyPosition, applyError, GPS_OPTIONS);
  }

  useEffect(() => {
    if (!navigator.geolocation) {
      setPermission('unavailable');
      setError('gps.unsupported');
      setConnecting(false);
      return;
    }

    setConnecting(true);
    navigator.geolocation.getCurrentPosition(applyPosition, applyError, GPS_OPTIONS);
    const watchId = navigator.geolocation.watchPosition(applyPosition, applyError, GPS_OPTIONS);

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const value = useMemo(
    () => ({ fix, error, permission, connecting, refresh }),
    [fix, error, permission, connecting],
  );

  return <DeviceLocationContext.Provider value={value}>{children}</DeviceLocationContext.Provider>;
}

export function useDeviceLocation() {
  const value = useContext(DeviceLocationContext);
  if (!value) {
    throw new Error('useDeviceLocation must be used inside DeviceLocationProvider');
  }
  return value;
}
