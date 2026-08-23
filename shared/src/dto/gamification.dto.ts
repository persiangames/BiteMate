export const USER_BADGE_TYPES = [
  'FOOD_EXPLORER',
  'SOCIAL_EATER',
  'TOP_REVIEWER',
  'TRUSTED_HOST',
] as const;
export type UserBadgeType = (typeof USER_BADGE_TYPES)[number];

export const USER_BADGE_LABELS: Record<UserBadgeType, string> = {
  FOOD_EXPLORER: 'Food Explorer',
  SOCIAL_EATER: 'Social Eater',
  TOP_REVIEWER: 'Top Reviewer',
  TRUSTED_HOST: 'Trusted Host',
};

export interface UserLevelDto {
  level: number;
  experiencePoints: number;
  nextLevelXp: number;
  progressPercent: number;
  breakdown: {
    meetups: number;
    posts: number;
    reviews: number;
    activity: number;
  };
}

export interface UserBadgeDto {
  badge: UserBadgeType;
  label: string;
  earnedAt: string;
}

export interface UserBadgesResponseDto {
  items: UserBadgeDto[];
}

export interface CreateMeetupReviewRequestDto {
  meetupId: string;
  reviewedUserId: string;
  rating: number;
  comment?: string;
}

export interface MeetupReviewDto {
  id: string;
  meetupId: string;
  reviewerId: string;
  reviewedUserId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}
