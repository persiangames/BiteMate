"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GeocodeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeocodeService = void 0;
const common_1 = require("@nestjs/common");
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'BiteMate/1.0 (geo proxy; contact@bitemate.app)';
let GeocodeService = GeocodeService_1 = class GeocodeService {
    logger = new common_1.Logger(GeocodeService_1.name);
    async fetchNominatim(path) {
        return fetch(`${NOMINATIM_BASE}${path}`, {
            headers: {
                Accept: 'application/json',
                'User-Agent': USER_AGENT,
            },
        });
    }
    cityFromAddress(address, fallback) {
        return (address?.city ||
            address?.town ||
            address?.village ||
            address?.municipality ||
            address?.hamlet ||
            fallback ||
            null);
    }
    countryFromAddress(address) {
        return address?.country ?? null;
    }
    async searchPlaces(query, country) {
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
            const rows = (await response.json());
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
            const seen = new Set();
            const hits = [];
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
        }
        catch (error) {
            this.logger.warn(`Place search failed: ${error instanceof Error ? error.message : error}`);
            return [];
        }
    }
    async reverseGeocode(latitude, longitude) {
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
            const data = (await response.json());
            const neighborhood = data.address?.neighbourhood ||
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
        }
        catch (error) {
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
    async geocodeCity(country, city) {
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
            const rows = (await response.json());
            const first = rows[0];
            if (!first) {
                return null;
            }
            return { latitude: Number(first.lat), longitude: Number(first.lon) };
        }
        catch {
            return null;
        }
    }
};
exports.GeocodeService = GeocodeService;
exports.GeocodeService = GeocodeService = GeocodeService_1 = __decorate([
    (0, common_1.Injectable)()
], GeocodeService);
//# sourceMappingURL=geocode.service.js.map