import type { UserRole } from '../types/platform.types';
import type { ProfileInterest, RelationshipStatus } from '../types/profile.types';
import type { Gender, MealSlot, EducationLevel } from '../types/dining.types';
import { MIN_PROFILE_COMPLETION_FOR_ACTIONS } from '../types/profile.types';

export interface ProfileCompletionInput {
  role: UserRole | null;
  fullName?: string | null;
  username?: string | null;
  bio?: string | null;
  profileImage?: string | null;
  coverImage?: string | null;
  country?: string | null;
  city?: string | null;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  education?: EducationLevel | null;
  preferredMeals?: MealSlot[];
  favoriteCuisines?: string[];
  favoriteFoods?: string[];
  interests?: ProfileInterest[];
  relationshipStatus?: RelationshipStatus | null;
  hasChildren?: boolean | null;
  liveLocationEnabled?: boolean;
  liveLatitude?: number | null;
  liveLongitude?: number | null;
  /** Venue: has at least one restaurant listing */
  hasRestaurantListing?: boolean;
  /** Home chef: profile + menu */
  hasHomeChefProfile?: boolean;
  hasHomeChefMenu?: boolean;
}

export interface ProfileCompletionResult {
  percent: number;
  missing: string[];
  canUseMeetupFeatures: boolean;
}

const VENUE_ROLES: UserRole[] = ['RESTAURANT_OWNER', 'CAFE_OWNER', 'FOOD_TRUCK_OWNER'];

function score(checks: Array<{ weight: number; ok: boolean; key: string }>): ProfileCompletionResult {
  const total = checks.reduce((sum, item) => sum + item.weight, 0);
  const earned = checks.filter((item) => item.ok).reduce((sum, item) => sum + item.weight, 0);
  const percent = total > 0 ? Math.round((earned / total) * 100) : 0;
  const missing = checks.filter((item) => !item.ok).map((item) => item.key);
  return {
    percent,
    missing,
    canUseMeetupFeatures: percent >= MIN_PROFILE_COMPLETION_FOR_ACTIONS,
  };
}

export function computeProfileCompletion(input: ProfileCompletionInput): ProfileCompletionResult {
  const role = input.role ?? 'NORMAL_USER';

  if (role === 'HOME_CHEF') {
    return score([
      { weight: 15, ok: Boolean(input.profileImage), key: 'profileImage' },
      { weight: 10, ok: Boolean(input.bio?.trim()), key: 'bio' },
      { weight: 10, ok: Boolean(input.username), key: 'username' },
      { weight: 15, ok: Boolean(input.hasHomeChefProfile), key: 'homeChefProfile' },
      { weight: 20, ok: Boolean(input.hasHomeChefMenu), key: 'homeChefMenu' },
      { weight: 10, ok: Boolean(input.country && input.city), key: 'location' },
      { weight: 10, ok: (input.interests?.length ?? 0) >= 3, key: 'interests' },
      { weight: 10, ok: Boolean(input.liveLatitude != null && input.liveLongitude != null), key: 'liveLocation' },
    ]);
  }

  if (VENUE_ROLES.includes(role)) {
    return score([
      { weight: 20, ok: Boolean(input.profileImage), key: 'profileImage' },
      { weight: 10, ok: Boolean(input.username), key: 'username' },
      { weight: 30, ok: Boolean(input.hasRestaurantListing), key: 'restaurantListing' },
      { weight: 15, ok: Boolean(input.country && input.city), key: 'location' },
      { weight: 15, ok: Boolean(input.liveLatitude != null && input.liveLongitude != null), key: 'liveLocation' },
      { weight: 10, ok: Boolean(input.bio?.trim()), key: 'bio' },
    ]);
  }

  return score([
    { weight: 15, ok: Boolean(input.profileImage), key: 'profileImage' },
    { weight: 10, ok: Boolean(input.bio?.trim()), key: 'bio' },
    { weight: 5, ok: Boolean(input.username), key: 'username' },
    { weight: 10, ok: Boolean(input.gender), key: 'gender' },
    { weight: 5, ok: Boolean(input.dateOfBirth), key: 'dateOfBirth' },
    { weight: 5, ok: Boolean(input.education), key: 'education' },
    { weight: 15, ok: (input.interests?.length ?? 0) >= 3, key: 'interests' },
    { weight: 10, ok: Boolean(input.relationshipStatus), key: 'relationshipStatus' },
    { weight: 5, ok: input.hasChildren != null, key: 'hasChildren' },
    { weight: 5, ok: (input.preferredMeals?.length ?? 0) >= 1, key: 'preferredMeals' },
    { weight: 5, ok: (input.favoriteCuisines?.length ?? 0) >= 1, key: 'favoriteCuisines' },
    { weight: 10, ok: Boolean(input.liveLocationEnabled && input.liveLatitude != null && input.liveLongitude != null), key: 'liveLocation' },
    { weight: 5, ok: Boolean(input.country && input.city), key: 'location' },
  ]);
}
