import { useEffect, useRef, useState } from 'react';
import { createStreetMap, maplibregl } from '@/data/geo/osm-style';
import {
  GPS_OPTIONS,
  GPS_OPTIONS_COARSE,
  gpsErrorKey,
  reverseGeocodePlace,
} from '@/data/geo/geocode';
import { useI18n } from '@/presentation/context/I18nContext';

export type EventLocationFix = {
  latitude: number;
  longitude: number;
  city: string | null;
  country: string | null;
};

type EventLocationMapProps = {
  eventLatitude: number | null;
  eventLongitude: number | null;
  onEventLocationChange: (fix: EventLocationFix) => void;
};

function RedPinElement() {
  return (
    <div className="event-map__pin" aria-hidden>
      <svg viewBox="0 0 48 64" width="36" height="48">
        <path
          d="M24 2C14.6 2 7 9.6 7 19c0 13.5 17 43 17 43s17-29.5 17-43C41 9.6 33.4 2 24 2Z"
          fill="#ef4444"
          stroke="#fff"
          strokeWidth="2"
        />
        <circle cx="24" cy="19" r="7" fill="#fff" />
        <circle cx="24" cy="19" r="3" fill="#ef4444" />
      </svg>
    </div>
  );
}

function UserDotElement() {
  return <div className="event-map__user-dot" aria-hidden />;
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

export function EventLocationMap({
  eventLatitude,
  eventLongitude,
  onEventLocationChange,
}: EventLocationMapProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const eventMarkerRef = useRef<maplibregl.Marker | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const onChangeRef = useRef(onEventLocationChange);
  const watchIdRef = useRef<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  onChangeRef.current = onEventLocationChange;

  async function emitEventLocation(lat: number, lng: number) {
    const place = await reverseGeocodePlace(lat, lng).catch(() => null);
    onChangeRef.current({
      latitude: lat,
      longitude: lng,
      city: place?.city ?? null,
      country: place?.country ?? null,
    });
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const startLng = eventLongitude ?? 51.389;
    const startLat = eventLatitude ?? 35.6892;

    const map = createStreetMap(containerRef.current, {
      center: [startLng, startLat],
      zoom: eventLatitude != null ? 15 : 11,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    const eventMarker = new maplibregl.Marker({
      element: RedPinElement(),
      draggable: true,
      anchor: 'bottom',
    })
      .setLngLat([startLng, startLat])
      .addTo(map);

    eventMarker.on('dragend', () => {
      const { lat, lng } = eventMarker.getLngLat();
      void emitEventLocation(lat, lng);
    });

    const userMarker = new maplibregl.Marker({
      element: UserDotElement(),
      anchor: 'center',
    })
      .setLngLat([startLng, startLat])
      .addTo(map);

    eventMarkerRef.current = eventMarker;
    userMarkerRef.current = userMarker;
    mapRef.current = map;

    window.setTimeout(() => map.resize(), 200);

    return () => {
      eventMarkerRef.current = null;
      userMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (eventLatitude == null || eventLongitude == null || !eventMarkerRef.current) {
      return;
    }
    const marker = eventMarkerRef.current;
    const current = marker.getLngLat();
    if (
      Math.abs(current.lat - eventLatitude) < 0.00005 &&
      Math.abs(current.lng - eventLongitude) < 0.00005
    ) {
      return;
    }
    marker.setLngLat([eventLongitude, eventLatitude]);
    mapRef.current?.easeTo({
      center: [eventLongitude, eventLatitude],
      zoom: Math.max(mapRef.current.getZoom(), 14),
      duration: 500,
    });
  }, [eventLatitude, eventLongitude]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError('gps.unsupported');
      return;
    }

    setGpsLoading(true);

    function onPosition(position: GeolocationPosition) {
      setGpsLoading(false);
      setGpsError(null);
      const { latitude, longitude } = position.coords;
      userMarkerRef.current?.setLngLat([longitude, latitude]);

      if (eventLatitude == null || eventLongitude == null) {
        eventMarkerRef.current?.setLngLat([longitude, latitude]);
        mapRef.current?.easeTo({ center: [longitude, latitude], zoom: 15, duration: 600 });
        void emitEventLocation(latitude, longitude);
      }
    }

    function onError(error: GeolocationPositionError) {
      setGpsLoading(false);
      setGpsError(gpsErrorKey(error.code));
    }

    navigator.geolocation.getCurrentPosition(onPosition, onError, GPS_OPTIONS);
    watchIdRef.current = navigator.geolocation.watchPosition(onPosition, onError, GPS_OPTIONS_COARSE);

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  function recenterOnUser() {
    if (!navigator.geolocation) {
      setGpsError('gps.unsupported');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLoading(false);
        setGpsError(null);
        const { latitude, longitude } = position.coords;
        userMarkerRef.current?.setLngLat([longitude, latitude]);
        mapRef.current?.easeTo({ center: [longitude, latitude], zoom: 16, duration: 700 });
      },
      (error) => {
        setGpsLoading(false);
        setGpsError(gpsErrorKey(error.code));
      },
      GPS_OPTIONS,
    );
  }

  return (
    <div className="event-map">
      <div ref={containerRef} className="map-container event-map__canvas" />
      <button
        type="button"
        className={`map-picker__recenter event-map__recenter${gpsLoading ? ' is-loading' : ''}`}
        aria-label={t('map.recenter')}
        disabled={gpsLoading}
        onClick={recenterOnUser}
      >
        <RecenterIcon />
      </button>
      <div className="event-map__legend">
        <span className="event-map__legend-item">
          <span className="event-map__legend-dot event-map__legend-dot--user" />
          {t('event.map.you')}
        </span>
        <span className="event-map__legend-item">
          <span className="event-map__legend-pin" aria-hidden>
            📍
          </span>
          {t('event.map.meetupPin')}
        </span>
      </div>
      {gpsLoading ? <p className="hint">{t('nearby.detecting')}</p> : null}
      {gpsError ? <p className="error">{t(gpsError)}</p> : null}
      <p className="hint">{t('event.map.dragHint')}</p>
    </div>
  );
}
