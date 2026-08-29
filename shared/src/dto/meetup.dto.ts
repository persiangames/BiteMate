export const MEETUP_STATUSES = [
  'OPEN',
  'SCHEDULED',
  'FULL',
  'COMPLETED',
  'CANCELLED',
  'EXPIRED',
] as const;
export type MeetupStatus = (typeof MEETUP_STATUSES)[number];

export const MEETUP_INVITE_STATUSES = [
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED',
] as const;
export type MeetupInviteStatus = (typeof MEETUP_INVITE_STATUSES)[number];

export const MEETUP_ROOM_STATUSES = ['ACTIVE', 'CLOSED'] as const;
export type MeetupRoomStatus = (typeof MEETUP_ROOM_STATUSES)[number];

export const MEETUP_MATCH_TYPES = ['USER', 'MEETUP'] as const;
export type MeetupMatchType = (typeof MEETUP_MATCH_TYPES)[number];

export interface MeetupUserSummaryDto {
  id: string;
  username: string | null;
  fullName: string | null;
  profileImage: string | null;
  meetupRating: number;
  meetupReviewCount: number;
  isPremium: boolean;
}

export interface MeetupDto {
  id: string;
  foodType: string;
  foodCategory: string | null;
  scheduledAt: string;
  radiusKm: number;
  desiredPeople: number;
  latitude: number;
  longitude: number;
  locationLabel: string | null;
  mealSlot: string | null;
  foodName: string | null;
  preferredGender: string | null;
  ageMin: number | null;
  ageMax: number | null;
  preferredEducation: string | null;
  preferredInterests: string[];
  country: string | null;
  city: string | null;
  status: MeetupStatus;
  notes: string | null;
  expiresAt: string;
  acceptedCount: number;
  seatsLeft: number;
  isFull: boolean;
  creator: MeetupUserSummaryDto;
  roomId: string | null;
  createdAt: string;
}

export interface CreateMeetupRequestDto {
  foodType: string;
  foodCategory?: string;
  scheduledAt: string;
  radiusKm: number;
  desiredPeople: number;
  latitude: number;
  longitude: number;
  locationLabel?: string;
  notes?: string;
  mealSlot?: string;
  foodName?: string;
  preferredGender?: string;
  ageMin?: number;
  ageMax?: number;
  preferredEducation?: string;
  preferredInterests?: string[];
  country?: string;
  city?: string;
}

export interface NearbyMeetupDto extends MeetupDto {
  distanceKm: number;
}

export interface NearbyMeetupsResponseDto {
  radiusKm: number;
  count: number;
  items: NearbyMeetupDto[];
}

export interface NearbyMeetupsQueryDto {
  latitude: number;
  longitude: number;
  radiusKm: number;
  mealSlot?: string;
  country?: string;
  city?: string;
  foodType?: string;
  foodName?: string;
  gender?: string;
  education?: string;
  ageMin?: number;
  ageMax?: number;
  interests?: string[];
}

export interface RequestMeetupJoinRequestDto {
  meetupId: string;
}

export interface MeetupMatchDto {
  matchType: MeetupMatchType;
  score: number;
  distanceKm: number;
  timeDiffMinutes: number;
  ratingDiff: number;
  user: MeetupUserSummaryDto;
  meetup: MeetupDto | null;
}

export interface MeetupMatchesResponseDto {
  meetupId: string;
  items: MeetupMatchDto[];
}

export interface MeetupInviteDto {
  id: string;
  meetupId: string;
  status: MeetupInviteStatus;
  expiresAt: string;
  createdAt: string;
  respondedAt: string | null;
  meetup: MeetupDto;
  inviter: MeetupUserSummaryDto;
  invitee: MeetupUserSummaryDto;
}

export interface SendMeetupInviteRequestDto {
  meetupId: string;
  inviteeId: string;
}

export interface RespondMeetupInviteRequestDto {
  inviteId: string;
}

export interface MeetupInvitesResponseDto {
  items: MeetupInviteDto[];
}

export interface MeetupRoomMessageDto {
  id: string;
  roomId: string;
  content: string;
  createdAt: string;
  sender: MeetupUserSummaryDto;
}

export interface MeetupRoomDto {
  id: string;
  meetupId: string;
  chatId: string | null;
  status: MeetupRoomStatus;
  members: MeetupUserSummaryDto[];
  meetup: MeetupDto;
}

export interface SendRoomMessageRequestDto {
  content: string;
}

export interface MeetupRoomMessagesResponseDto {
  items: MeetupRoomMessageDto[];
}

export interface MeetupInviteLimitDto {
  usedToday: number;
  dailyLimit: number;
  isPremium: boolean;
}
