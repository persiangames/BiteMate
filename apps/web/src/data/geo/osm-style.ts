import maplibregl, { type StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

/** OSM raster tiles via MapLibre — no Mapbox token, so zoom does not wipe the canvas. */
export const OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
    },
  ],
};

export function createStreetMap(
  container: HTMLElement,
  options: { center: [number, number]; zoom: number },
) {
  return new maplibregl.Map({
    container,
    style: OSM_STYLE,
    center: options.center,
    zoom: options.zoom,
    minZoom: 2,
    maxZoom: 19,
    attributionControl: true,
  });
}

export { maplibregl };
