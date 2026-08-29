import { ageFromDateOfBirth, type MealSlot } from '@bitemate/shared';

export function meetupCapacity(desiredPeople: number, acceptedCount: number) {
  const occupied = acceptedCount + 1;
  const seatsLeft = Math.max(0, desiredPeople - occupied);
  return {
    occupied,
    seatsLeft,
    isFull: seatsLeft <= 0,
  };
}

export function normalizeTags(values?: string[] | null, max = 20): string[] {
  if (!values?.length) {
    return [];
  }
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of values) {
    const value = raw.trim().replace(/\s+/g, ' ');
    const key = value.toLowerCase();
    if (!value || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(value);
    if (result.length >= max) {
      break;
    }
  }
  return result;
}

export function tagsMatch(haystack: string[], needle?: string): boolean {
  if (!needle?.trim()) {
    return true;
  }
  const query = needle.trim().toLowerCase();
  return haystack.some((item) => item.toLowerCase().includes(query));
}

export function mealFromCategory(category?: string | null): MealSlot | null {
  const value = category?.trim().toLowerCase();
  if (value === 'breakfast') return 'BREAKFAST';
  if (value === 'lunch') return 'LUNCH';
  if (value === 'afternoon') return 'AFTERNOON';
  if (value === 'snack') return 'SNACK';
  if (value === 'dinner') return 'DINNER';
  if (value === 'beverage' || value === 'drinks') return 'BEVERAGE';
  if (value === 'breakfast' || value === 'BREAKFAST') return 'BREAKFAST';
  return null;
}

export function isRecentlyOnline(lastLiveLocationAt?: Date | null, minutes = 15): boolean {
  if (!lastLiveLocationAt) {
    return false;
  }
  return Date.now() - lastLiveLocationAt.getTime() <= minutes * 60 * 1000;
}

export function diningCompatibility(
  viewer: {
    preferredMeals?: string[] | null;
    favoriteCuisines?: string[] | null;
    favoriteFoods?: string[] | null;
    interests?: string[] | null;
    city?: string | null;
    country?: string | null;
  } | null,
  candidate: {
    preferredMeals?: string[] | null;
    favoriteCuisines?: string[] | null;
    favoriteFoods?: string[] | null;
    interests?: string[] | null;
    city?: string | null;
    country?: string | null;
    lookingToEat?: boolean;
  },
): number {
  let score = 42;
  const viewerMeals = new Set((viewer?.preferredMeals ?? []).map((item) => item.toLowerCase()));
  const sharedMeals = (candidate.preferredMeals ?? []).filter((item) =>
    viewerMeals.has(item.toLowerCase()),
  ).length;
  if (sharedMeals) {
    score += Math.min(18, sharedMeals * 8);
  }

  const viewerFoods = new Set(
    [...(viewer?.favoriteFoods ?? []), ...(viewer?.favoriteCuisines ?? [])].map((item) =>
      item.toLowerCase(),
    ),
  );
  const sharedFoods = [...(candidate.favoriteFoods ?? []), ...(candidate.favoriteCuisines ?? [])].filter(
    (item) => viewerFoods.has(item.toLowerCase()),
  ).length;
  if (sharedFoods) {
    score += Math.min(20, sharedFoods * 7);
  }

  const viewerInterests = new Set(viewer?.interests ?? []);
  const sharedInterests = (candidate.interests ?? []).filter((item) => viewerInterests.has(item)).length;
  if (sharedInterests) {
    score += Math.min(15, sharedInterests * 5);
  }

  if (viewer?.city && candidate.city && viewer.city.toLowerCase() === candidate.city.toLowerCase()) {
    score += 10;
  } else if (
    viewer?.country &&
    candidate.country &&
    viewer.country.toLowerCase() === candidate.country.toLowerCase()
  ) {
    score += 5;
  }

  if (candidate.lookingToEat) {
    score += 8;
  }

  return Math.min(99, score);
}

export { ageFromDateOfBirth };
