import type { EducationLevel, Gender, MealSlot } from '../types/dining.types';
import type { AvailabilityStatus } from '../types/location.types';
import type { UserRole } from '../types/platform.types';
import type { ProfileInterest, RelationshipStatus } from '../types/profile.types';

export interface UpdateLiveLocationRequestDto {
  latitude: number;
  longitude: number;
}

export interface LiveLocationSettingsDto {
  liveLocationEnabled: boolean;
  invisibleMode: boolean;
  availabilityStatus: AvailabilityStatus;
}

export interface NearbyUserDto {
  id: string;
  username: string | null;
  fullName: string | null;
  bio: string | null;
  role: UserRole | null;
  profileImage: string | null;
  availabilityStatus: AvailabilityStatus;
  distanceKm: number;
  latitude: number;
  longitude: number;
  city: string | null;
  country: string | null;
  age: number | null;
  gender: Gender | null;
  education: EducationLevel | null;
  preferredMeals: MealSlot[];
  favoriteCuisines: string[];
  favoriteFoods: string[];
  lookingToEat: boolean;
  meetupRating: number;
  meetupReviewCount: number;
  lastLiveLocationAt: string | null;
  isOnline: boolean;
  compatibility: number;
  interests: ProfileInterest[];
  relationshipStatus: RelationshipStatus | null;
}

export interface NearbyUsersResponseDto {
  radiusKm: number;
  count: number;
  users: NearbyUserDto[];
}

export interface UserSearchHitDto {
  id: string;
  username: string | null;
  fullName: string | null;
  profileImage: string | null;
  role: UserRole | null;
  followerCount: number;
  bio: string | null;
}

export interface PublicUserDto {
  id: string;
  username: string | null;
  fullName: string | null;
  bio: string | null;
  profileImage: string | null;
  coverImage: string | null;
  role: UserRole | null;
  city: string | null;
  country: string | null;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  hostedMeetupCount: number;
  attendedMeetupCount: number;
  age: number | null;
  gender: Gender | null;
  education: EducationLevel | null;
  preferredMeals: MealSlot[];
  favoriteCuisines: string[];
  favoriteFoods: string[];
  lookingToEat: boolean;
  interests: ProfileInterest[];
  relationshipStatus: RelationshipStatus | null;
  hasChildren: boolean | null;
}

export type ProfileMeetupRole = 'hosted' | 'attended';
export type ProfileVenueKind = 'HOME' | 'RESTAURANT' | 'OTHER';

export interface ProfileMeetupEventDto {
  id: string;
  foodType: string;
  scheduledAt: string;
  locationLabel: string | null;
  venueKind: ProfileVenueKind;
  restaurantId: string | null;
  restaurantName: string | null;
  attendeeCount: number;
  rating: number;
  reviewCount: number;
  role: 'HOST' | 'GUEST';
}

export interface ProfileMeetupHistoryDto {
  items: ProfileMeetupEventDto[];
}

export interface NearbyQueryDto {
  latitude: number;
  longitude: number;
  radiusKm: number;
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
  interests?: ProfileInterest[];
  relationshipStatus?: RelationshipStatus;
}
