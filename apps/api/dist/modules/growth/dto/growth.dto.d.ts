export declare class RankingsQueryDto {
    city?: string;
    limit: number;
}
export declare class PremiumSubscribeDto {
    paymentMethod?: 'WALLET' | 'STRIPE';
    idempotencyKey?: string;
}
export declare class CreateRestaurantAdDto {
    restaurantId: string;
    title: string;
    imageUrl?: string;
    targetUrl?: string;
    budget: number;
    durationDays?: number;
}
export declare class AdClickDto {
    referrerUserId?: string;
}
export declare class CreateMeetupReviewDto {
    meetupId: string;
    reviewedUserId: string;
    rating: number;
    comment?: string;
}
