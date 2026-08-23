export interface UserRankingEntryDto {
  rank: number;
  userId: string;
  username: string | null;
  fullName: string | null;
  profileImage: string | null;
  rankScore: number;
  meetupRating: number;
  meetupReviewCount: number;
  successfulMeetups: number;
  activityPoints: number;
  isPremium: boolean;
}

export interface UserRankingsResponseDto {
  items: UserRankingEntryDto[];
  city: string | null;
  updatedAt: string;
}

export interface RestaurantRankingEntryDto {
  rank: number;
  restaurantId: string;
  name: string;
  city: string | null;
  country: string | null;
  profileImage: string | null;
  rankScore: number;
  averageRating: number;
  reviewCount: number;
  visitCount: number;
  conversionCount: number;
  conversionRate: number;
  isSponsored: boolean;
}

export interface RestaurantRankingsResponseDto {
  items: RestaurantRankingEntryDto[];
  city: string | null;
  updatedAt: string;
}

export interface PremiumBenefitsDto {
  dailyInviteLimit: number;
  unlimitedInvites?: boolean;
  visibilityBoost: number;
  priorityRankingBoost: number;
  priorityMatchingBoost?: number;
  removeLimits?: boolean;
}

export interface PremiumStatusDto {
  isPremium: boolean;
  expiresAt: string | null;
  planId: string | null;
  benefits: PremiumBenefitsDto;
}

export interface PremiumSubscribeRequestDto {
  paymentMethod?: 'WALLET' | 'STRIPE';
  idempotencyKey?: string;
}

export interface PremiumSubscribeResponseDto {
  subscriptionId: string;
  isPremium: boolean;
  expiresAt: string;
  amount: number;
  currency: string;
}

export interface RestaurantAdDto {
  id: string;
  restaurantId: string;
  restaurantName: string;
  title: string;
  imageUrl: string | null;
  targetUrl: string | null;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  status: 'PENDING_PAYMENT' | 'ACTIVE' | 'PAUSED' | 'ENDED';
  startsAt: string;
  endsAt: string | null;
}

export interface CreateRestaurantAdRequestDto {
  restaurantId: string;
  title: string;
  imageUrl?: string;
  targetUrl?: string;
  budget: number;
  durationDays?: number;
}

export interface AffiliateCommissionDto {
  id: string;
  sourceType: 'BOOKING' | 'RESTAURANT_AD_CLICK';
  sourceId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
  createdAt: string;
}

export interface AffiliateCommissionsResponseDto {
  items: AffiliateCommissionDto[];
  totalPending: number;
  totalPaid: number;
}
