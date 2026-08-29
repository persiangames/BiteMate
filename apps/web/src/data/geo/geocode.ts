import { countryFromIso } from '@/data/geo/world';
import { apiFetch } from '@/data/api/client';
import { getAccessToken } from '@/data/api/sessionBridge';

const NOMINATIM_HEADERS = {
  Accept: 'application/json',
};

export type GpsFix = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

export type PlaceHit = {
  city: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
};

export type ReversePlace = {
  neighborhood: string | null;
  city: string | null;
  country: string | null;
  countryCode: string | null;
  displayName: string | null;
};

type NominatimAddress = {
  country?: string;
  country_code?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  city_district?: string;
  hamlet?: string;
};

function cityFromAddress(address?: NominatimAddress, fallback?: string): string | null {
  return (
    address?.city ||
    address?.town ||
    address?.village ||
    address?.municipality ||
    address?.hamlet ||
    fallback ||
    null
  );
}

function countryFromAddress(address?: NominatimAddress): string | null {
  return countryFromIso(address?.country_code) ?? address?.country ?? null;
}

async function withGeoProxy<T>(path: string, fallback: () => Promise<T>): Promise<T> {
  if (!getAccessToken()) {
    return fallback();
  }
  try {
    return await apiFetch<T>(path);
  } catch {
    return fallback();
  }
}

export async function geocodeCity(country: string, city: string): Promise<{ latitude: number; longitude: number } | null> {
  const params = new URLSearchParams({ country, city });
  const proxied = await withGeoProxy<{ latitude: number; longitude: number } | null>(
    `/geo/city?${params.toString()}`,
    async () => {
      const searchParams = new URLSearchParams({
        format: 'jsonv2',
        limit: '1',
        city,
        country,
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${searchParams.toString()}`, {
        headers: NOMINATIM_HEADERS,
      });
      if (!response.ok) {
        return null;
      }
      const rows = (await response.json()) as Array<{ lat: string; lon: string }>;
      const first = rows[0];
      if (!first) {
        return null;
      }
      return { latitude: Number(first.lat), longitude: Number(first.lon) };
    },
  );
  return proxied;
}

export async function searchPlaces(query: string, country?: string): Promise<PlaceHit[]> {
  const needle = query.trim();
  if (needle.length < 2) {
    return [];
  }

  const params = new URLSearchParams({ q: needle });
  if (country) {
    params.set('country', country);
  }

  return withGeoProxy<PlaceHit[]>(`/geo/search?${params.toString()}`, async () => {
    const searchParams = new URLSearchParams({
      format: 'jsonv2',
      q: country ? `${needle}, ${country}` : needle,
      addressdetails: '1',
      limit: '10',
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${searchParams.toString()}`, {
      headers: NOMINATIM_HEADERS,
    });
    if (!response.ok) {
      return [];
    }

    const rows = (await response.json()) as Array<{
      lat: string;
      lon: string;
      name?: string;
      display_name?: string;
      type?: string;
      addresstype?: string;
      address?: NominatimAddress;
    }>;

    const allowed = new Set([
      'city',
      'town',
      'village',
      'municipality',
      'county',
      'state',
      'suburb',
      'hamlet',
      'neighbourhood',
      'administrative',
    ]);

    const seen = new Set<string>();
    const hits: PlaceHit[] = [];

    for (const row of rows) {
      const kind = row.addresstype || row.type || '';
      if (kind && !allowed.has(kind)) {
        continue;
      }
      const city = cityFromAddress(row.address, row.name);
      const mappedCountry = countryFromAddress(row.address);
      if (!city || !mappedCountry) {
        continue;
      }
      const key = `${mappedCountry}|${city}`.toLowerCase();
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      hits.push({
        city,
        country: mappedCountry,
        countryCode: (row.address?.country_code ?? '').toUpperCase(),
        latitude: Number(row.lat),
        longitude: Number(row.lon),
      });
    }

    return hits;
  });
}

export async function reverseGeocodePlace(latitude: number, longitude: number): Promise<ReversePlace> {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
  });

  return withGeoProxy<ReversePlace>(`/geo/reverse?${params.toString()}`, async () => {
    const searchParams = new URLSearchParams({
      format: 'jsonv2',
      lat: String(latitude),
      lon: String(longitude),
      zoom: '16',
      addressdetails: '1',
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${searchParams.toString()}`, {
      headers: NOMINATIM_HEADERS,
    });
    if (!response.ok) {
      return { neighborhood: null, city: null, country: null, countryCode: null, displayName: null };
    }
    const data = (await response.json()) as {
      display_name?: string;
      address?: NominatimAddress;
    };
    const neighborhood =
      data.address?.neighbourhood ||
      data.address?.suburb ||
      data.address?.quarter ||
      data.address?.city_district ||
      null;

    return {
      neighborhood,
      city: cityFromAddress(data.address),
      country: countryFromAddress(data.address),
      countryCode: data.address?.country_code?.toUpperCase() ?? null,
      displayName: data.display_name ?? null,
    };
  });
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  const place = await reverseGeocodePlace(latitude, longitude);
  return place.neighborhood || place.city || place.displayName || null;
}

export const GPS_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 12000,
};

/** Faster fallback when high-accuracy fix is slow (Wi‑Fi / coarse cell). */
export const GPS_OPTIONS_COARSE: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 5000,
  timeout: 6000,
};

export function gpsErrorKey(code: number): string {
  if (code === 1) {
    return 'gps.denied';
  }
  if (code === 2) {
    return 'gps.unavailable';
  }
  return 'gps.timeout';
}
