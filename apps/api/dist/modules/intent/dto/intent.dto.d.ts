import { type EducationLevel, type Gender, type MealSlot } from '@bitemate/shared';
export declare class CreateIntentDto {
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
    mealSlot?: MealSlot;
    foodName?: string;
    preferredGender?: Gender;
    ageMin?: number;
    ageMax?: number;
    preferredEducation?: EducationLevel;
    country?: string;
    city?: string;
    locationLabel?: string;
}
export declare class IntentMatchQueryDto {
    intentId: string;
}
export declare class CancelIntentDto {
    intentId: string;
}
