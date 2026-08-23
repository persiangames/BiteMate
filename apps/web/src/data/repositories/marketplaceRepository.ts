import type {
  BookingDto,
  BookingsListResponseDto,
  CreateBookingRequestDto,
  CreateHomeChefMenuRequestDto,
  CreateHomeChefProfileRequestDto,
  CreateRestaurantMenuItemRequestDto,
  CreateRestaurantRequestDto,
  CreateReviewRequestDto,
  HomeChefMenuItemDto,
  HomeChefProfileDto,
  RestaurantDto,
  RestaurantMenuItemDto,
  RestaurantsListResponseDto,
  ReviewDto,
  ReviewsListResponseDto,
} from '@bitemate/shared';
import { apiFetch, authHeaders } from '@/data/api/client';

export async function fetchRestaurants(
  accessToken: string,
  params?: { search?: string; city?: string; cursor?: string },
): Promise<RestaurantsListResponseDto> {
  const search = new URLSearchParams({ limit: '20' });
  if (params?.search) search.set('search', params.search);
  if (params?.city) search.set('city', params.city);
  if (params?.cursor) search.set('cursor', params.cursor);

  return apiFetch<RestaurantsListResponseDto>(`/restaurants?${search.toString()}`, {
    headers: authHeaders(accessToken),
  });
}

export async function fetchRestaurant(
  accessToken: string,
  restaurantId: string,
): Promise<RestaurantDto> {
  return apiFetch<RestaurantDto>(`/restaurants/${restaurantId}`, {
    headers: authHeaders(accessToken),
  });
}

export async function createRestaurant(
  accessToken: string,
  payload: CreateRestaurantRequestDto,
): Promise<RestaurantDto> {
  return apiFetch<RestaurantDto>('/restaurants', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function addRestaurantMenuItem(
  accessToken: string,
  restaurantId: string,
  payload: CreateRestaurantMenuItemRequestDto,
): Promise<RestaurantMenuItemDto> {
  return apiFetch<RestaurantMenuItemDto>(`/restaurants/${restaurantId}/menu`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function upsertHomeChefProfile(
  accessToken: string,
  payload: CreateHomeChefProfileRequestDto,
): Promise<HomeChefProfileDto> {
  return apiFetch<HomeChefProfileDto>('/home-chef/profile', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function fetchMyHomeChefProfile(
  accessToken: string,
): Promise<HomeChefProfileDto> {
  return apiFetch<HomeChefProfileDto>('/home-chef/profile/me', {
    headers: authHeaders(accessToken),
  });
}

export async function fetchHomeChefProfile(
  accessToken: string,
  chefId: string,
): Promise<HomeChefProfileDto> {
  return apiFetch<HomeChefProfileDto>(`/home-chef/${chefId}`, {
    headers: authHeaders(accessToken),
  });
}

export async function createHomeChefMenuItem(
  accessToken: string,
  payload: CreateHomeChefMenuRequestDto,
): Promise<HomeChefMenuItemDto> {
  return apiFetch<HomeChefMenuItemDto>('/home-chef/menu', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function fetchHomeChefMenuItems(
  accessToken: string,
  params?: { chefId?: string; date?: string },
): Promise<HomeChefMenuItemDto[]> {
  const search = new URLSearchParams();
  if (params?.chefId) search.set('chefId', params.chefId);
  if (params?.date) search.set('date', params.date);
  const query = search.toString();

  return apiFetch<HomeChefMenuItemDto[]>(
    `/home-chef/menu${query ? `?${query}` : ''}`,
    { headers: authHeaders(accessToken) },
  );
}

export async function createBooking(
  accessToken: string,
  payload: CreateBookingRequestDto,
): Promise<BookingDto> {
  return apiFetch<BookingDto>('/booking', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function fetchMyBookings(
  accessToken: string,
): Promise<BookingsListResponseDto> {
  return apiFetch<BookingsListResponseDto>('/bookings/me', {
    headers: authHeaders(accessToken),
  });
}

export async function createReview(
  accessToken: string,
  payload: CreateReviewRequestDto,
): Promise<ReviewDto> {
  return apiFetch<ReviewDto>('/review', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function fetchReviews(
  accessToken: string,
  params: { restaurantId?: string; homeChefProfileId?: string },
): Promise<ReviewsListResponseDto> {
  const search = new URLSearchParams({ limit: '20' });
  if (params.restaurantId) search.set('restaurantId', params.restaurantId);
  if (params.homeChefProfileId) search.set('homeChefProfileId', params.homeChefProfileId);

  return apiFetch<ReviewsListResponseDto>(`/reviews?${search.toString()}`, {
    headers: authHeaders(accessToken),
  });
}
