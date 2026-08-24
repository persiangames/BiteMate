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
export declare class GeocodeService {
    private readonly logger;
    private fetchNominatim;
    private cityFromAddress;
    private countryFromAddress;
    searchPlaces(query: string, country?: string): Promise<PlaceSearchHitDto[]>;
    reverseGeocode(latitude: number, longitude: number): Promise<ReversePlaceDto>;
    geocodeCity(country: string, city: string): Promise<{
        latitude: number;
        longitude: number;
    } | null>;
}
