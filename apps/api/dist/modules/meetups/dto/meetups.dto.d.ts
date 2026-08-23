import { type EducationLevel, type Gender, type MealSlot } from '@bitemate/shared';
export declare class CreateMeetupDto {
    foodType: string;
    foodCategory?: string;
    scheduledAt: string;
    radiusKm: number;
    desiredPeople: number;
    latitude: number;
    longitude: number;
    locationLabel?: string;
    notes?: string;
    mealSlot?: MealSlot;
    foodName?: string;
    preferredGender?: Gender;
    ageMin?: number;
    ageMax?: number;
    preferredEducation?: EducationLevel;
    country?: string;
    city?: string;
}
export declare class NearbyMeetupsQueryDto {
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
}
export declare class MeetupMatchQueryDto {
    meetupId: string;
}
export declare class SendMeetupInviteDto {
    meetupId: string;
    inviteeId: string;
}
export declare class RespondMeetupInviteDto {
    inviteId: string;
}
export declare class SendRoomMessageDto {
    content: string;
}
