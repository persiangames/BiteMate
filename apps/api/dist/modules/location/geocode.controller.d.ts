import { GeocodeService } from './geocode.service';
declare class GeoSearchQueryDto {
    q: string;
    country?: string;
}
declare class GeoReverseQueryDto {
    lat: number;
    lon: number;
}
declare class GeoCityQueryDto {
    country: string;
    city: string;
}
export declare class GeocodeController {
    private readonly geocodeService;
    constructor(geocodeService: GeocodeService);
    search(query: GeoSearchQueryDto): Promise<import("./geocode.service").PlaceSearchHitDto[]>;
    reverse(query: GeoReverseQueryDto): Promise<import("./geocode.service").ReversePlaceDto>;
    city(query: GeoCityQueryDto): Promise<{
        latitude: number;
        longitude: number;
    } | null>;
}
export {};
