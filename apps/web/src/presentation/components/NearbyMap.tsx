import { useEffect, useRef, useState } from 'react';
import type { NearbyUserDto } from '@bitemate/shared';
import { createStreetMap, maplibregl } from '@/data/geo/osm-style';
import { useI18n } from '@/presentation/context/I18nContext';
import { resolveMediaUrl } from '@/utils/mediaUrl';

type NearbyMapProps = {
  center: { latitude: number; longitude: number };
  nearbyUsers: NearbyUserDto[];
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

export function NearbyMap({ center, nearbyUsers }: NearbyMapProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const selfMarkerRef = useRef<maplibregl.Marker | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [failed, setFailed] = useState(false);

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
    selfMarkerRef.current = new maplibregl.Marker({ color: '#ea580c' })
      .setLngLat([center.longitude, center.latitude])
      .setPopup(new maplibregl.Popup().setText('You'))
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
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      selfMarkerRef.current?.remove();
      selfMarkerRef.current = null;
      try {
        map.remove();
      } catch {
        /* ignore */
      }
      mapRef.current = null;
    };
    // Map is created once; later GPS updates use setCenter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || !isValidCoord(center.latitude, center.longitude)) {
      return;
    }
    mapRef.current.setCenter([center.longitude, center.latitude]);
    selfMarkerRef.current?.setLngLat([center.longitude, center.latitude]);
  }, [center.latitude, center.longitude]);

  useEffect(() => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (!mapRef.current) {
      return;
    }

    markersRef.current = nearbyUsers
      .filter((user) => isValidCoord(user.latitude, user.longitude))
      .map((user) =>
        new maplibregl.Marker({ color: '#2563eb' })
          .setLngLat([user.longitude, user.latitude])
          .setPopup(
            new maplibregl.Popup().setHTML(
              `<div style="display:flex;gap:8px;align-items:center">
                ${user.profileImage ? `<img src="${resolveMediaUrl(user.profileImage)}" alt="" width="36" height="36" style="border-radius:50%;object-fit:cover">` : ''}
                <div><strong>${user.fullName ?? user.username ?? 'User'}</strong><br/>${user.distanceKm.toFixed(1)} km</div>
              </div>`,
            ),
          )
          .addTo(mapRef.current!),
      );
  }, [nearbyUsers]);

  return (
    <div ref={containerRef} className="map-container">
      {failed ? <div className="map-placeholder">{t('nearby.mapFailed')}</div> : null}
    </div>
  );
}
