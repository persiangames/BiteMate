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

export function LocationPickerMap({
  latitude,
  longitude,
  onChange,
}: LocationPickerMapProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const manualRef = useRef(false);

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
    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: GPS_OPTIONS,
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: true,
    });
    map.addControl(geolocate, 'top-right');

    const marker = new maplibregl.Marker({ color: '#ea580c', draggable: true })
      .setLngLat([startLng, startLat])
      .addTo(map);

    async function emit(lat: number, lng: number, accuracy: number, source: 'gps' | 'map') {
      const place = await reverseGeocodePlace(lat, lng).catch(() => null);
      onChangeRef.current({
        latitude: lat,
        longitude: lng,
        accuracy,
        neighborhood: place?.neighborhood ?? place?.city ?? place?.displayName ?? null,
        city: place?.city ?? null,
        country: place?.country ?? null,
        source,
      });
    }

    marker.on('dragend', () => {
      manualRef.current = true;
      const next = marker.getLngLat();
      void emit(next.lat, next.lng, 15, 'map');
    });

    map.on('click', (event) => {
      manualRef.current = true;
      marker.setLngLat(event.lngLat);
      void emit(event.lngLat.lat, event.lngLat.lng, 15, 'map');
    });

    geolocate.on('geolocate', (event: GeolocationPosition) => {
      if (manualRef.current) {
        return;
      }
      const { latitude, longitude, accuracy } = event.coords;
      marker.setLngLat([longitude, latitude]);
      void emit(latitude, longitude, accuracy, 'gps');
    });

    mapRef.current = map;
    markerRef.current = marker;
    window.setTimeout(() => map.resize(), 200);

    return () => {
      marker.remove();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (latitude == null || longitude == null || !mapRef.current || !markerRef.current) {
      return;
    }
    markerRef.current.setLngLat([longitude, latitude]);
    mapRef.current.easeTo({ center: [longitude, latitude], zoom: 15, duration: 600 });
  }, [latitude, longitude]);

  function useDeviceGps() {
    if (!navigator.geolocation) {
      return;
    }
    manualRef.current = false;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        markerRef.current?.setLngLat([next.longitude, next.latitude]);
        mapRef.current?.easeTo({ center: [next.longitude, next.latitude], zoom: 16, duration: 700 });
        void reverseGeocodePlace(next.latitude, next.longitude)
          .then((place) => {
            onChangeRef.current({
              ...next,
              neighborhood: place.neighborhood ?? place.city ?? place.displayName,
              city: place.city,
              country: place.country,
              source: 'gps',
            });
          })
          .catch(() => {
            onChangeRef.current({
              ...next,
              neighborhood: null,
              city: null,
              country: null,
              source: 'gps',
            });
          });
      },
      () => undefined,
      GPS_OPTIONS,
    );
  }

  return (
    <div className="location-picker">
      <div ref={containerRef} className="map-container location-picker__map" />
      <div className="location-picker__actions">
        <button type="button" className="btn-primary" onClick={useDeviceGps}>
          {t('gps.useDevice')}
        </button>
        <p className="hint">{t('map.pickHint')}</p>
      </div>
    </div>
  );
}
