import type { BookingDto, BookingsListResponseDto, HomeChefMenuItemDto, HomeChefProfileDto, HomeChefSummaryDto, RestaurantDto, RestaurantMenuItemDto, RestaurantsListResponseDto, ReviewDto, ReviewsListResponseDto } from '@bitemate/shared';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, CreateHomeChefMenuDto, CreateHomeChefProfileDto, CreateRestaurantDto, CreateRestaurantMenuItemDto, CreateReviewDto, HomeChefMenuQueryDto, RestaurantsQueryDto, ReviewsQueryDto, UpdateBookingStatusDto } from './dto/marketplace.dto';
import { HomeChefService } from './home-chef.service';
import { RestaurantsService } from './restaurants.service';
import { ReviewsService } from './reviews.service';
export declare class MarketplaceController {
    private readonly restaurantsService;
    private readonly homeChefService;
    private readonly bookingsService;
    private readonly reviewsService;
    constructor(restaurantsService: RestaurantsService, homeChefService: HomeChefService, bookingsService: BookingsService, reviewsService: ReviewsService);
    createRestaurant(user: JwtPayload, dto: CreateRestaurantDto): Promise<RestaurantDto>;
    listRestaurants(query: RestaurantsQueryDto): Promise<RestaurantsListResponseDto>;
    getRestaurant(user: JwtPayload, id: string): Promise<RestaurantDto>;
    addRestaurantMenuItem(user: JwtPayload, restaurantId: string, dto: CreateRestaurantMenuItemDto): Promise<RestaurantMenuItemDto>;
    upsertHomeChefProfile(user: JwtPayload, dto: CreateHomeChefProfileDto): Promise<HomeChefProfileDto>;
    getMyHomeChefProfile(user: JwtPayload): Promise<HomeChefProfileDto>;
    listHomeChefs(): Promise<HomeChefSummaryDto[]>;
    getHomeChefProfile(id: string): Promise<HomeChefProfileDto>;
    createHomeChefMenuItem(user: JwtPayload, dto: CreateHomeChefMenuDto): Promise<HomeChefMenuItemDto>;
    listHomeChefMenuItems(query: HomeChefMenuQueryDto): Promise<HomeChefMenuItemDto[]>;
    createBooking(user: JwtPayload, dto: CreateBookingDto): Promise<BookingDto>;
    listMyBookings(user: JwtPayload): Promise<BookingsListResponseDto>;
    updateBookingStatus(user: JwtPayload, bookingId: string, dto: UpdateBookingStatusDto): Promise<BookingDto>;
    createReview(user: JwtPayload, dto: CreateReviewDto): Promise<ReviewDto>;
    listReviews(query: ReviewsQueryDto): Promise<ReviewsListResponseDto>;
}
