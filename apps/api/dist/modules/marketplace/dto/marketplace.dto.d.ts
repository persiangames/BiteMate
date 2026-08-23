import { type BookingType, type DayOfWeek, type ReviewTargetType } from '@bitemate/shared';
export declare class OpeningHourDto {
    dayOfWeek: DayOfWeek;
    openTime: string;
    closeTime: string;
    isClosed?: boolean;
}
export declare class CreateRestaurantDto {
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
export declare class RestaurantsQueryDto {
    cursor?: string;
    city?: string;
    country?: string;
    search?: string;
    limit: number;
}
export declare class CreateRestaurantMenuItemDto {
    name: string;
    description?: string;
    price: number;
    currency?: string;
    category?: string;
    imageUrl?: string;
    discountPercent?: number;
    isAvailable?: boolean;
}
export declare class HomeChefAvailabilityDto {
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
}
export declare class CreateHomeChefProfileDto {
    bio?: string;
    specialties?: string[];
    acceptsOrders?: boolean;
    availability?: HomeChefAvailabilityDto[];
}
export declare class CreateHomeChefMenuDto {
    name: string;
    description?: string;
    price: number;
    currency?: string;
    imageUrl?: string;
    availableDate: string;
    servingsAvailable: number;
}
export declare class HomeChefMenuQueryDto {
    chefId?: string;
    date?: string;
}
export declare class CreateBookingDto {
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
export declare class UpdateBookingStatusDto {
    status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}
export declare class CreateReviewDto {
    targetType: ReviewTargetType;
    restaurantId?: string;
    homeChefProfileId?: string;
    bookingId?: string;
    rating: number;
    text?: string;
}
export declare class ReviewsQueryDto {
    restaurantId?: string;
    homeChefProfileId?: string;
    cursor?: string;
    limit: number;
}
