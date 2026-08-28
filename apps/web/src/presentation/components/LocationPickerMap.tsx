import { useEffect, useRef } from 'react';
import { createStreetMap, maplibregl } from '@/data/geo/osm-style';
import { GPS_OPTIONS, reverseGeocodePlace, type GpsFix } from '@/data/geo/geocode';
import { useI18n } from '@/presentation/context/I18nContext';

type LocationPickerMapProps = {
  latitude: number | null;
  longitude: number | null;
  onChange: (
    fix: GpsFix & {
      neighborhood: string | null;
      city: string | null;
      country: string | null;
      source: 'gps' | 'map';
    },
  ) => void;
};

function CenterPinIcon() {
  return (
    <svg viewBox="0 0 48 64" width="40" height="52" aria-hidden>
      <path
        d="M24 2C14.6 2 7 9.6 7 19c0 13.5 17 43 17 43s17-29.5 17-43C41 9.6 33.4 2 24 2Z"
        fill="#ff4b3e"
        stroke="#fff"
        strokeWidth="2"
      />
      <circle cx="24" cy="19" r="7" fill="#fff" />
      <circle cx="24" cy="19" r="3" fill="#ff4b3e" />
    </svg>
  );
}

function RecenterIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LocationPickerMap({
  latitude,
  longitude,
  onChange,
}: LocationPickerMapProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const onChangeRef = useRef(onChange);
  const geocodeTimer = useRef<number | null>(null);
  const ignoreMoveEnd = useRef(false);
  const lastGpsRef = useRef<{ latitude: number; longitude: number } | null>(null);

  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const startLng = longitude ?? 51.389;
    const startLat = latitude ?? 35.6892;

    const map = createStreetMap(containerRef.current, {
      center: [startLng, startLat],
      zoom: latitude != null ? 15 : 11,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    async function emitCenter(source: 'gps' | 'map') {
      const center = map.getCenter();
      const place = await reverseGeocodePlace(center.lat, center.lng).catch(() => null);
      onChangeRef.current({
        latitude: center.lat,
        longitude: center.lng,
        accuracy: 15,
        neighborhood: place?.neighborhood ?? place?.city ?? place?.displayName ?? null,
        city: place?.city ?? null,
        country: place?.country ?? null,
        source,
      });
    }

    map.on('moveend', () => {
      if (ignoreMoveEnd.current) {
        ignoreMoveEnd.current = false;
        return;
      }
      if (geocodeTimer.current) {
        window.clearTimeout(geocodeTimer.current);
      }
      geocodeTimer.current = window.setTimeout(() => {
        void emitCenter('map');
      }, 280);
    });

    mapRef.current = map;
    window.setTimeout(() => map.resize(), 200);

    return () => {
      if (geocodeTimer.current) {
        window.clearTimeout(geocodeTimer.current);
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (latitude == null || longitude == null || !mapRef.current) {
      return;
    }
    const map = mapRef.current;
    const current = map.getCenter();
    const samePlace =
      Math.abs(current.lat - latitude) < 0.00005 && Math.abs(current.lng - longitude) < 0.00005;
    if (samePlace) {
      return;
    }
    ignoreMoveEnd.current = true;
    map.easeTo({ center: [longitude, latitude], zoom: Math.max(map.getZoom(), 14), duration: 600 });
  }, [latitude, longitude]);

  function flyTo(lat: number, lng: number, source: 'gps' | 'map') {
    if (!mapRef.current) {
      return;
    }
    ignoreMoveEnd.current = true;
    mapRef.current.easeTo({ center: [lng, lat], zoom: 16, duration: 700 });
    void reverseGeocodePlace(lat, lng)
      .then((place) => {
        onChangeRef.current({
          latitude: lat,
          longitude: lng,
          accuracy: 15,
          neighborhood: place.neighborhood ?? place.city ?? place.displayName,
          city: place.city,
          country: place.country,
          source,
        });
      })
      .catch(() => {
        onChangeRef.current({
          latitude: lat,
          longitude: lng,
          accuracy: 15,
          neighborhood: null,
          city: null,
          country: null,
          source,
        });
      });
  }

  function recenterOnGps() {
    if (!navigator.geolocation) {
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        lastGpsRef.current = next;
        flyTo(next.latitude, next.longitude, 'gps');
      },
      () => undefined,
      GPS_OPTIONS,
    );
  }

  return (
    <div className="map-picker">
      <div ref={containerRef} className="map-container location-picker__map" />
      <div className="map-picker__pin" aria-hidden>
        <CenterPinIcon />
      </div>
      <button
        type="button"
        className="map-picker__recenter"
        aria-label={t('map.recenter')}
        onClick={recenterOnGps}
      >
        <RecenterIcon />
      </button>
      <div className="location-picker__actions">
        <button type="button" className="btn-primary" onClick={recenterOnGps}>
          {t('gps.useDevice')}
        </button>
        <p className="hint">{t('map.pickHint')}</p>
      </div>
    </div>
  );
}
