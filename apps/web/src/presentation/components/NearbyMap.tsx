import { useEffect, useRef, useState } from 'react';
import { createStreetMap, maplibregl } from '@/data/geo/osm-style';
import { useI18n } from '@/presentation/context/I18nContext';

type NearbyMapProps = {
  center: { latitude: number; longitude: number };
};

function isValidCoord(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function createUserDotElement(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'event-map__user-dot';
  el.setAttribute('aria-hidden', 'true');
  return el;
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

export function NearbyMap({ center }: NearbyMapProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const selfMarkerRef = useRef<maplibregl.Marker | null>(null);
  const centerRef = useRef(center);
  const [failed, setFailed] = useState(false);

  centerRef.current = center;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    let map: maplibregl.Map;
    try {
      map = createStreetMap(container, {
        center: [center.longitude, center.latitude],
        zoom: 12,
      });
    } catch {
      setFailed(true);
      return undefined;
    }

    mapRef.current = map;
    selfMarkerRef.current = new maplibregl.Marker({ element: createUserDotElement() })
      .setLngLat([center.longitude, center.latitude])
      .addTo(map);

    const resize = () => {
      try {
        map.resize();
      } catch {
        /* ignore */
      }
    };
    map.once('load', resize);
    const resizeTimer = window.setTimeout(resize, 250);

    return () => {
      window.clearTimeout(resizeTimer);
      selfMarkerRef.current?.remove();
      selfMarkerRef.current = null;
      try {
        map.remove();
      } catch {
        /* ignore */
      }
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || !isValidCoord(center.latitude, center.longitude)) {
      return;
    }
    mapRef.current.setCenter([center.longitude, center.latitude]);
    selfMarkerRef.current?.setLngLat([center.longitude, center.latitude]);
  }, [center.latitude, center.longitude]);

  function recenterOnSelf() {
    const next = centerRef.current;
    if (!mapRef.current || !isValidCoord(next.latitude, next.longitude)) {
      return;
    }
    mapRef.current.easeTo({
      center: [next.longitude, next.latitude],
      zoom: Math.max(mapRef.current.getZoom(), 13),
      duration: 700,
    });
    selfMarkerRef.current?.setLngLat([next.longitude, next.latitude]);
  }

  return (
    <div className="map-picker">
      <div ref={containerRef} className="map-container">
        {failed ? <div className="map-placeholder">{t('nearby.mapFailed')}</div> : null}
      </div>
      {!failed ? (
        <button
          type="button"
          className="map-picker__recenter"
          aria-label={t('map.recenter')}
          onClick={recenterOnSelf}
        >
          <RecenterIcon />
        </button>
      ) : null}
    </div>
  );
}
