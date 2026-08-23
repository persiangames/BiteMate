export const AVAILABILITY_STATUSES = ['AVAILABLE', 'BUSY', 'OFFLINE'] as const;
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

export const NEARBY_RADIUS_OPTIONS_KM = [1, 5, 10, 50] as const;
export type NearbyRadiusKm = (typeof NEARBY_RADIUS_OPTIONS_KM)[number];

export const AVAILABILITY_STATUS_LABELS: Record<AvailabilityStatus, string> = {
  AVAILABLE: 'Available',
  BUSY: 'Busy',
  OFFLINE: 'Offline',
};
