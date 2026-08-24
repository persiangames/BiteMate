import { Injectable, Logger } from '@nestjs/common';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'BiteMate/1.0 (geo proxy; contact@bitemate.app)';

type NominatimAddress = {
  country?: string;
  country_code?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  hamlet?: string;
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  city_district?: string;
};

export type PlaceSearchHitDto = {
  city: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
};

export type ReversePlaceDto = {
  neighborhood: string | null;
  city: string | null;
  country: string | null;
  countryCode: string | null;
  displayName: string | null;
};

@Injectable()
export class GeocodeService {
  private readonly logger = new Logger(GeocodeService.name);

  private async fetchNominatim(path: string): Promise<Response> {
    return fetch(`${NOMINATIM_BASE}${path}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': USER_AGENT,
      },
    });
  }

  private cityFromAddress(address?: NominatimAddress, fallback?: string): string | null {
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

  private countryFromAddress(address?: NominatimAddress): string | null {
    return address?.country ?? null;
  }

  async searchPlaces(query: string, country?: string): Promise<PlaceSearchHitDto[]> {
    const needle = query.trim();
    if (needle.length < 2) {
      return [];
    }

    const params = new URLSearchParams({
      format: 'jsonv2',
      q: country ? `${needle}, ${country}` : needle,
      addressdetails: '1',
      limit: '12',
    });

    try {
      const response = await this.fetchNominatim(`/search?${params.toString()}`);
      if (!response.ok) {
        return [];
      }

      const rows = (await response.json()) as Array<{
        lat: string;
        lon: string;
        name?: string;
        addresstype?: string;
        type?: string;
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
      const hits: PlaceSearchHitDto[] = [];

      for (const row of rows) {
        const kind = row.addresstype || row.type || '';
        if (kind && !allowed.has(kind)) {
          continue;
        }
        const city = this.cityFromAddress(row.address, row.name);
        const mappedCountry = this.countryFromAddress(row.address);
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
    } catch (error) {
      this.logger.warn(`Place search failed: ${error instanceof Error ? error.message : error}`);
      return [];
    }
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<ReversePlaceDto> {
    const params = new URLSearchParams({
      format: 'jsonv2',
      lat: String(latitude),
      lon: String(longitude),
      zoom: '16',
      addressdetails: '1',
    });

    try {
      const response = await this.fetchNominatim(`/reverse?${params.toString()}`);
      if (!response.ok) {
        return {
          neighborhood: null,
          city: null,
          country: null,
          countryCode: null,
          displayName: null,
        };
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
        city: this.cityFromAddress(data.address),
        country: this.countryFromAddress(data.address),
        countryCode: data.address?.country_code?.toUpperCase() ?? null,
        displayName: data.display_name ?? null,
      };
    } catch (error) {
      this.logger.warn(`Reverse geocode failed: ${error instanceof Error ? error.message : error}`);
      return {
        neighborhood: null,
        city: null,
        country: null,
        countryCode: null,
        displayName: null,
      };
    }
  }

  async geocodeCity(
    country: string,
    city: string,
  ): Promise<{ latitude: number; longitude: number } | null> {
    const params = new URLSearchParams({
      format: 'jsonv2',
      limit: '1',
      city,
      country,
    });

    try {
      const response = await this.fetchNominatim(`/search?${params.toString()}`);
      if (!response.ok) {
        return null;
      }
      const rows = (await response.json()) as Array<{ lat: string; lon: string }>;
      const first = rows[0];
      if (!first) {
        return null;
      }
      return { latitude: Number(first.lat), longitude: Number(first.lon) };
    } catch {
      return null;
    }
  }
}
