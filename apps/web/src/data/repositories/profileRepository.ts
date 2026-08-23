import type {
  AuthUserDto,
  NearbyUsersResponseDto,
  ProfileMeetupHistoryDto,
  PublicUserDto,
  UpdateLiveLocationRequestDto,
  UpdateProfileRequestDto,
  UserSearchHitDto,
} from '@bitemate/shared';
import type {
  EducationLevel,
  Gender,
  MealSlot,
  NearbyMeetupsResponseDto,
  NearbyQueryDto,
} from '@bitemate/shared';
import { apiFetch, authHeaders } from '@/data/api/client';

export async function getProfile(accessToken: string): Promise<AuthUserDto> {
  return apiFetch<AuthUserDto>('/users/me', {
    headers: authHeaders(accessToken),
  });
}

export async function updateProfile(
  accessToken: string,
  payload: UpdateProfileRequestDto,
): Promise<AuthUserDto> {
  return apiFetch<AuthUserDto>('/users/me', {
    method: 'PUT',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function updateLiveLocation(
  accessToken: string,
  payload: UpdateLiveLocationRequestDto,
): Promise<AuthUserDto> {
  return apiFetch<AuthUserDto>('/location/live', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function checkUsernameAvailable(
  accessToken: string,
  username: string,
): Promise<{ username: string; available: boolean }> {
  const search = new URLSearchParams({ username });
  return apiFetch(`/users/username-available?${search.toString()}`, {
    headers: authHeaders(accessToken),
  });
}

export async function requestContactChange(
  accessToken: string,
  payload: { channel: 'email' | 'phone'; value: string },
) {
  return apiFetch<{ message: string; expiresInSeconds: number; devCode?: string }>(
    '/users/me/contact/request',
    {
      method: 'POST',
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    },
  );
}

export async function verifyContactChange(
  accessToken: string,
  payload: { channel: 'email' | 'phone'; value: string; code: string },
): Promise<AuthUserDto> {
  return apiFetch<AuthUserDto>('/users/me/contact/verify', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function fetchNearbyUsers(
  accessToken: string,
  params: NearbyQueryDto & { radius?: number },
): Promise<NearbyUsersResponseDto> {
  const search = new URLSearchParams({
    latitude: String(params.latitude),
    longitude: String(params.longitude),
    radius: String(params.radiusKm ?? params.radius ?? 10),
  });

  const extras: Array<[string, string | number | boolean | undefined]> = [
    ['role', params.role],
    ['availability', params.availability],
    ['ageMin', params.ageMin],
    ['ageMax', params.ageMax],
    ['gender', params.gender],
    ['education', params.education],
    ['mealSlot', params.mealSlot],
    ['country', params.country],
    ['city', params.city],
    ['foodType', params.foodType],
    ['foodName', params.foodName],
    ['lookingToEat', params.lookingToEat === true ? 'true' : undefined],
  ];

  for (const [key, value] of extras) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  }

  return apiFetch<NearbyUsersResponseDto>(`/users/nearby?${search.toString()}`, {
    headers: authHeaders(accessToken),
  });
}

export async function fetchNearbyMeetups(
  accessToken: string,
  params: {
    latitude: number;
    longitude: number;
    radiusKm: number;
    mealSlot?: MealSlot;
    country?: string;
    city?: string;
    foodType?: string;
    foodName?: string;
    gender?: Gender;
    education?: EducationLevel;
    ageMin?: number;
    ageMax?: number;
  },
): Promise<NearbyMeetupsResponseDto> {
  const search = new URLSearchParams({
    latitude: String(params.latitude),
    longitude: String(params.longitude),
    radiusKm: String(params.radiusKm),
  });
  const extras: Array<[string, string | number | undefined]> = [
    ['mealSlot', params.mealSlot],
    ['country', params.country],
    ['city', params.city],
    ['foodType', params.foodType],
    ['foodName', params.foodName],
    ['gender', params.gender],
    ['education', params.education],
    ['ageMin', params.ageMin],
    ['ageMax', params.ageMax],
  ];
  for (const [key, value] of extras) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  }
  return apiFetch<NearbyMeetupsResponseDto>(`/meetups/nearby?${search.toString()}`, {
    headers: authHeaders(accessToken),
  });
}

export async function setupTwoFactor(accessToken: string) {
  return apiFetch<{ otpauthUrl: string; qrDataUrl: string; secret: string }>('/users/me/2fa/setup', {
    method: 'POST',
    headers: authHeaders(accessToken),
  });
}

export async function enableTwoFactor(accessToken: string, code: string) {
  return apiFetch<AuthUserDto>('/users/me/2fa/enable', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ code }),
  });
}

export async function disableTwoFactor(
  accessToken: string,
  payload: { password: string; code: string },
) {
  return apiFetch<AuthUserDto>('/users/me/2fa/disable', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function changePassword(
  accessToken: string,
  payload: { currentPassword: string; newPassword: string },
) {
  return apiFetch<{ message: string }>('/users/me/password', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function updateTheme(accessToken: string, theme: 'light' | 'dark') {
  return apiFetch<AuthUserDto>('/users/me/theme', {
    method: 'PATCH',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ theme }),
  });
}

export async function requestAccountDeletion(
  accessToken: string,
  payload: { password: string; confirmation: string; channel: 'email' | 'phone' },
) {
  return apiFetch<{ message: string; expiresInSeconds: number; devCode?: string }>(
    '/users/me/delete/request',
    {
      method: 'POST',
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    },
  );
}

export async function confirmAccountDeletion(
  accessToken: string,
  payload: { channel: 'email' | 'phone'; code: string },
) {
  return apiFetch<{ message: string }>('/users/me/delete/confirm', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function searchUsers(
  accessToken: string,
  query: string,
): Promise<UserSearchHitDto[]> {
  return apiFetch<UserSearchHitDto[]>(`/users/search?q=${encodeURIComponent(query)}`, {
    headers: authHeaders(accessToken),
  });
}

export async function fetchPublicUser(
  accessToken: string,
  username: string,
): Promise<PublicUserDto> {
  return apiFetch<PublicUserDto>(`/users/by-username/${encodeURIComponent(username)}`, {
    headers: authHeaders(accessToken),
  });
}

export async function fetchPublicUserById(
  accessToken: string,
  userId: string,
): Promise<PublicUserDto> {
  return apiFetch<PublicUserDto>(`/users/id/${encodeURIComponent(userId)}/public`, {
    headers: authHeaders(accessToken),
  });
}

export async function fetchMeetupHistory(
  accessToken: string,
  userId: string,
  kind: 'hosted' | 'attended',
): Promise<ProfileMeetupHistoryDto> {
  return apiFetch<ProfileMeetupHistoryDto>(
    `/users/id/${encodeURIComponent(userId)}/meetups?kind=${kind}`,
    { headers: authHeaders(accessToken) },
  );
}
