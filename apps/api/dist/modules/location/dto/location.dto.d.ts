import { type AvailabilityStatus, type EducationLevel, type Gender, type MealSlot, type UserRole } from '@bitemate/shared';
export declare class UpdateLiveLocationDto {
    latitude: number;
    longitude: number;
}
export declare class NearbyUsersQueryDto {
    latitude: number;
    longitude: number;
    radius: number;
    role?: UserRole;
    availability?: AvailabilityStatus;
    ageMin?: number;
    ageMax?: number;
    gender?: Gender;
    education?: EducationLevel;
    mealSlot?: MealSlot;
    country?: string;
    city?: string;
    foodType?: string;
    foodName?: string;
    lookingToEat?: boolean;
    get radiusKm(): number;
}
