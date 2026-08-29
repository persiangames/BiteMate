import type { PostDto } from './feed.dto';

export const FOOD_INTENT_STATUSES = [
  'ACTIVE',
  'MATCHED',
  'CANCELLED',
  'EXPIRED',
  'COMPLETED',
] as const;
export type FoodIntentStatus = (typeof FOOD_INTENT_STATUSES)[number];

export const INTENT_MATCH_TYPES = ['INTENT', 'USER'] as const;
export type IntentMatchType = (typeof INTENT_MATCH_TYPES)[number];

export interface IntentUserSummaryDto {
  id: string;
  username: string | null;
  fullName: string | null;
  profileImage: string | null;
  role: string | null;
  meetupRating: number;
  meetupReviewCount: number;
  successfulMeetups: number;
  cancelCount: number;
  reliabilityScore: number;
  isPremium: boolean;
}

export interface FoodIntentDto {
  id: string;
  foodType: string;
  foodCategory: string | null;
  timeStart: string;
  timeEnd: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  desiredPeople: number;
  budgetMin: number | null;
  budgetMax: number | null;
  status: FoodIntentStatus;
  expiresAt: string;
  meetupId: string | null;
  createdAt: string;
}

export interface CreateFoodIntentResponseDto {
  intent: FoodIntentDto;
  feedPost: PostDto | null;
}

export interface CreateFoodIntentRequestDto {
  foodType: string;
  foodCategory?: string;
  timeStart: string;
  timeEnd?: string;
  radiusKm: number;
  desiredPeople: number;
  latitude: number;
  longitude: number;
  budgetMin?: number;
  budgetMax?: number;
  mealSlot?: string;
  foodName?: string;
  preferredGender?: string;
  ageMin?: number;
  ageMax?: number;
  preferredEducation?: string;
  country?: string;
  city?: string;
  locationLabel?: string;
  notes?: string;
  preferredInterests?: string[];
}

export interface CancelFoodIntentRequestDto {
  intentId: string;
}

export interface IntentMatchScoreBreakdownDto {
  distance: number;
  foodSimilarity: number;
  timeOverlap: number;
  ratingSimilarity: number;
  reliability: number;
}

export interface IntentMatchDto {
  matchType: IntentMatchType;
  score: number;
  scoreBreakdown: IntentMatchScoreBreakdownDto;
  distanceKm: number;
  timeOverlapMinutes: number;
  user: IntentUserSummaryDto;
  intent: FoodIntentDto | null;
}

export interface IntentMatchesResponseDto {
  intentId: string;
  items: IntentMatchDto[];
  cached: boolean;
}

export interface FoodIntentListResponseDto {
  items: FoodIntentDto[];
}

export interface IntentDailyLimitDto {
  usedToday: number;
  dailyLimit: number;
  activeCount: number;
  maxActive: number;
}
