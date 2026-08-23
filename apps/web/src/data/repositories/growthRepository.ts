import type {
  AffiliateCommissionsResponseDto,
  PremiumStatusDto,
  PremiumSubscribeRequestDto,
  PremiumSubscribeResponseDto,
  RestaurantAdDto,
  RestaurantRankingsResponseDto,
  UserBadgesResponseDto,
  UserLevelDto,
  UserRankingsResponseDto,
} from '@bitemate/shared';
import { apiFetch, authHeaders } from '@/data/api/client';

export async function fetchUserLevel(accessToken: string): Promise<UserLevelDto> {
  return apiFetch<UserLevelDto>('/user/level', {
    headers: authHeaders(accessToken),
  });
}

export async function fetchUserBadges(accessToken: string): Promise<UserBadgesResponseDto> {
  return apiFetch<UserBadgesResponseDto>('/user/badges', {
    headers: authHeaders(accessToken),
  });
}

export async function fetchUserRankings(city?: string): Promise<UserRankingsResponseDto> {
  const search = new URLSearchParams({ limit: '30' });
  if (city) search.set('city', city);
  return apiFetch<UserRankingsResponseDto>(`/ranking/users?${search.toString()}`);
}

export async function fetchRestaurantRankings(
  city?: string,
): Promise<RestaurantRankingsResponseDto> {
  const search = new URLSearchParams({ limit: '30' });
  if (city) search.set('city', city);
  return apiFetch<RestaurantRankingsResponseDto>(
    `/ranking/restaurants?${search.toString()}`,
  );
}

export async function fetchPremiumStatus(accessToken: string): Promise<PremiumStatusDto> {
  return apiFetch<PremiumStatusDto>('/premium/status', {
    headers: authHeaders(accessToken),
  });
}

export async function subscribePremium(
  accessToken: string,
  payload: PremiumSubscribeRequestDto = { paymentMethod: 'WALLET' },
): Promise<PremiumSubscribeResponseDto> {
  return apiFetch<PremiumSubscribeResponseDto>('/premium/subscribe', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function fetchActiveAds(): Promise<RestaurantAdDto[]> {
  return apiFetch<RestaurantAdDto[]>('/monetization/restaurant-ads/active');
}

export async function fetchAffiliateCommissions(
  accessToken: string,
): Promise<AffiliateCommissionsResponseDto> {
  return apiFetch<AffiliateCommissionsResponseDto>('/monetization/affiliate/commissions', {
    headers: authHeaders(accessToken),
  });
}

export async function createRestaurantAd(
  accessToken: string,
  payload: {
    restaurantId: string;
    title: string;
    budget: number;
    imageUrl?: string;
    targetUrl?: string;
    durationDays?: number;
  },
): Promise<RestaurantAdDto> {
  return apiFetch<RestaurantAdDto>('/monetization/restaurant-ads', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function recordAdImpression(adId: string): Promise<void> {
  await apiFetch(`/monetization/restaurant-ads/${adId}/impression`, { method: 'POST' });
}
