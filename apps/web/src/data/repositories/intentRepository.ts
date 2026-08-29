import type {
  CancelFoodIntentRequestDto,
  CreateFoodIntentRequestDto,
  CreateFoodIntentResponseDto,
  FoodIntentDto,
  FoodIntentListResponseDto,
  IntentDailyLimitDto,
  IntentMatchesResponseDto,
} from '@bitemate/shared';
import { apiFetch, authHeaders } from '@/data/api/client';

export async function createFoodIntent(
  accessToken: string,
  payload: CreateFoodIntentRequestDto,
): Promise<CreateFoodIntentResponseDto> {
  return apiFetch<CreateFoodIntentResponseDto>('/intent/create', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function fetchIntentMatches(
  accessToken: string,
  intentId: string,
): Promise<IntentMatchesResponseDto> {
  return apiFetch<IntentMatchesResponseDto>(
    `/intent/matches?intentId=${encodeURIComponent(intentId)}`,
    { headers: authHeaders(accessToken) },
  );
}

export async function cancelFoodIntent(
  accessToken: string,
  payload: CancelFoodIntentRequestDto,
): Promise<FoodIntentDto> {
  return apiFetch<FoodIntentDto>('/intent/cancel', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function fetchMyIntents(accessToken: string): Promise<FoodIntentListResponseDto> {
  return apiFetch<FoodIntentListResponseDto>('/intent/me', {
    headers: authHeaders(accessToken),
  });
}

export async function fetchIntentDailyLimit(
  accessToken: string,
): Promise<IntentDailyLimitDto> {
  return apiFetch<IntentDailyLimitDto>('/intent/limit', {
    headers: authHeaders(accessToken),
  });
}
