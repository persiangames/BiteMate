export const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export const BOOKING_TYPES = ['RESTAURANT_TABLE', 'HOME_CHEF_MEAL'] as const;
export type BookingType = (typeof BOOKING_TYPES)[number];

export const BOOKING_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED',
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const REVIEW_TARGET_TYPES = ['RESTAURANT', 'HOME_CHEF'] as const;
export type ReviewTargetType = (typeof REVIEW_TARGET_TYPES)[number];

export interface OpeningHourDto {
  dayOfWeek: DayOfWeek;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface RestaurantMenuItemDto {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  category: string | null;
  imageUrl: string | null;
  discountPercent: number;
  discountedPrice: number;
  isAvailable: boolean;
}

export interface RestaurantSummaryDto {
  id: string;
  name: string;
  description: string | null;
  profileImage: string | null;
  coverImage: string | null;
  city: string | null;
  country: string | null;
  cuisineTypes: string[];
  averageRating: number;
  reviewCount: number;
  rankScore?: number;
  visitCount?: number;
  conversionCount?: number;
  isSponsored?: boolean;
  isActive?: boolean;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface RestaurantDto extends RestaurantSummaryDto {
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phoneNumber: string | null;
  openingHours: OpeningHourDto[];
  menuItems: RestaurantMenuItemDto[];
  ownerId: string;
  isActive: boolean;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface RestaurantsListResponseDto {
  items: RestaurantSummaryDto[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CreateRestaurantRequestDto {
  name: string;
  description?: string;
  profileImage?: string;
  coverImage?: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  phoneNumber?: string;
  cuisineTypes?: string[];
  openingHours?: OpeningHourDto[];
}

export interface CreateRestaurantMenuItemRequestDto {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  category?: string;
  imageUrl?: string;
  discountPercent?: number;
  isAvailable?: boolean;
}

export interface HomeChefAvailabilityDto {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface HomeChefMenuItemDto {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  imageUrl: string | null;
  availableDate: string;
  servingsAvailable: number;
  servingsRemaining: number;
  isActive: boolean;
}

export interface HomeChefProfileDto {
  id: string;
  userId: string;
  bio: string | null;
  specialties: string[];
  averageRating: number;
  reviewCount: number;
  acceptsOrders: boolean;
  isActive: boolean;
  chefName: string | null;
  chefUsername: string | null;
  chefProfileImage: string | null;
  availability: HomeChefAvailabilityDto[];
  menuItems: HomeChefMenuItemDto[];
}

export interface HomeChefSummaryDto {
  id: string;
  chefName: string | null;
  chefUsername: string | null;
  chefProfileImage: string | null;
  bio: string | null;
  specialties: string[];
  averageRating: number;
  reviewCount: number;
}

export interface HomeChefsListResponseDto {
  items: HomeChefSummaryDto[];
}

export interface CreateHomeChefProfileRequestDto {
  bio?: string;
  specialties?: string[];
  acceptsOrders?: boolean;
  availability?: HomeChefAvailabilityDto[];
}

export interface CreateHomeChefMenuRequestDto {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  availableDate: string;
  servingsAvailable: number;
}

export interface BookingDto {
  id: string;
  type: BookingType;
  status: BookingStatus;
  restaurantId: string | null;
  restaurantName: string | null;
  homeChefProfileId: string | null;
  homeChefName: string | null;
  homeChefMenuItemId: string | null;
  menuItemName: string | null;
  bookingDate: string;
  bookingTime: string;
  partySize: number | null;
  quantity: number;
  totalPrice: number;
  currency: string;
  notes: string | null;
  createdAt: string;
}

export interface BookingsListResponseDto {
  items: BookingDto[];
}

export interface CreateBookingRequestDto {
  type: BookingType;
  restaurantId?: string;
  homeChefMenuItemId?: string;
  bookingDate: string;
  bookingTime: string;
  partySize?: number;
  quantity?: number;
  notes?: string;
  affiliateReferrerId?: string;
}

export interface ReviewAuthorDto {
  id: string;
  username: string | null;
  fullName: string | null;
  profileImage: string | null;
}

export interface ReviewDto {
  id: string;
  targetType: ReviewTargetType;
  restaurantId: string | null;
  homeChefProfileId: string | null;
  rating: number;
  text: string | null;
  isVerifiedPurchase: boolean;
  author: ReviewAuthorDto;
  createdAt: string;
}

export interface ReviewsListResponseDto {
  items: ReviewDto[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CreateReviewRequestDto {
  targetType: ReviewTargetType;
  restaurantId?: string;
  homeChefProfileId?: string;
  bookingId?: string;
  rating: number;
  text?: string;
}
