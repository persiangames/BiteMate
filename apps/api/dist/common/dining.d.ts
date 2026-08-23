import { ageFromDateOfBirth, type MealSlot } from '@bitemate/shared';
export declare function meetupCapacity(desiredPeople: number, acceptedCount: number): {
    occupied: number;
    seatsLeft: number;
    isFull: boolean;
};
export declare function normalizeTags(values?: string[] | null, max?: number): string[];
export declare function tagsMatch(haystack: string[], needle?: string): boolean;
export declare function mealFromCategory(category?: string | null): MealSlot | null;
export declare function isRecentlyOnline(lastLiveLocationAt?: Date | null, minutes?: number): boolean;
export declare function diningCompatibility(viewer: {
    preferredMeals?: string[] | null;
    favoriteCuisines?: string[] | null;
    favoriteFoods?: string[] | null;
    city?: string | null;
    country?: string | null;
} | null, candidate: {
    preferredMeals?: string[] | null;
    favoriteCuisines?: string[] | null;
    favoriteFoods?: string[] | null;
    city?: string | null;
    country?: string | null;
    lookingToEat?: boolean;
}): number;
export { ageFromDateOfBirth };
