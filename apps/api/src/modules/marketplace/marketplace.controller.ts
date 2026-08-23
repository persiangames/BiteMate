import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type {
  BookingDto,
  BookingsListResponseDto,
  HomeChefMenuItemDto,
  HomeChefProfileDto,
  HomeChefSummaryDto,
  RestaurantDto,
  RestaurantMenuItemDto,
  RestaurantsListResponseDto,
  ReviewDto,
  ReviewsListResponseDto,
} from '@bitemate/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  RequireOtpVerified,
  Roles,
} from '../../common/decorators/auth.decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OtpVerifiedGuard } from '../../common/guards/otp-verified.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { BookingsService } from './bookings.service';
import {
  CreateBookingDto,
  CreateHomeChefMenuDto,
  CreateHomeChefProfileDto,
  CreateRestaurantDto,
  CreateRestaurantMenuItemDto,
  CreateReviewDto,
  HomeChefMenuQueryDto,
  RestaurantsQueryDto,
  ReviewsQueryDto,
  UpdateBookingStatusDto,
} from './dto/marketplace.dto';
import { HomeChefService } from './home-chef.service';
import { RestaurantsService } from './restaurants.service';
import { ReviewsService } from './reviews.service';

@Controller()
@UseGuards(JwtAuthGuard, OtpVerifiedGuard, RolesGuard)
export class MarketplaceController {
  constructor(
    private readonly restaurantsService: RestaurantsService,
    private readonly homeChefService: HomeChefService,
    private readonly bookingsService: BookingsService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Post('restaurants')
  @RequireOtpVerified()
  @Roles('RESTAURANT_OWNER')
  createRestaurant(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateRestaurantDto,
  ): Promise<RestaurantDto> {
    return this.restaurantsService.createRestaurant(user.sub, dto);
  }

  @Get('restaurants')
  @RequireOtpVerified()
  listRestaurants(
    @Query() query: RestaurantsQueryDto,
  ): Promise<RestaurantsListResponseDto> {
    return this.restaurantsService.listRestaurants(query);
  }

  @Get('restaurants/:id')
  @RequireOtpVerified()
  getRestaurant(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<RestaurantDto> {
    return this.restaurantsService.getRestaurant(id, user.sub);
  }

  @Post('restaurants/:id/menu')
  @RequireOtpVerified()
  @Roles('RESTAURANT_OWNER')
  addRestaurantMenuItem(
    @CurrentUser() user: JwtPayload,
    @Param('id') restaurantId: string,
    @Body() dto: CreateRestaurantMenuItemDto,
  ): Promise<RestaurantMenuItemDto> {
    return this.restaurantsService.addMenuItem(user.sub, restaurantId, dto);
  }

  @Post('home-chef/profile')
  @RequireOtpVerified()
  @Roles('HOME_CHEF')
  upsertHomeChefProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateHomeChefProfileDto,
  ): Promise<HomeChefProfileDto> {
    return this.homeChefService.upsertProfile(user.sub, dto);
  }

  @Get('home-chef/profile/me')
  @RequireOtpVerified()
  @Roles('HOME_CHEF')
  getMyHomeChefProfile(
    @CurrentUser() user: JwtPayload,
  ): Promise<HomeChefProfileDto> {
    return this.homeChefService.getMyProfile(user.sub);
  }

  @Get('home-chefs')
  @RequireOtpVerified()
  listHomeChefs(): Promise<HomeChefSummaryDto[]> {
    return this.homeChefService.listHomeChefs();
  }

  @Get('home-chef/:id')
  @RequireOtpVerified()
  getHomeChefProfile(@Param('id') id: string): Promise<HomeChefProfileDto> {
    return this.homeChefService.getProfile(id);
  }

  @Post('home-chef/menu')
  @RequireOtpVerified()
  @Roles('HOME_CHEF')
  createHomeChefMenuItem(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateHomeChefMenuDto,
  ): Promise<HomeChefMenuItemDto> {
    return this.homeChefService.createMenuItem(user.sub, dto);
  }

  @Get('home-chef/menu')
  @RequireOtpVerified()
  listHomeChefMenuItems(
    @Query() query: HomeChefMenuQueryDto,
  ): Promise<HomeChefMenuItemDto[]> {
    return this.homeChefService.listMenuItems(query);
  }

  @Post('booking')
  @RequireOtpVerified()
  createBooking(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateBookingDto,
  ): Promise<BookingDto> {
    return this.bookingsService.createBooking(user.sub, dto);
  }

  @Get('bookings/me')
  @RequireOtpVerified()
  listMyBookings(
    @CurrentUser() user: JwtPayload,
  ): Promise<BookingsListResponseDto> {
    return this.bookingsService.listMyBookings(user.sub);
  }

  @Patch('bookings/:id/status')
  @RequireOtpVerified()
  updateBookingStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') bookingId: string,
    @Body() dto: UpdateBookingStatusDto,
  ): Promise<BookingDto> {
    return this.bookingsService.updateBookingStatus(user.sub, bookingId, dto);
  }

  @Post('review')
  @RequireOtpVerified()
  createReview(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewDto> {
    return this.reviewsService.createReview(user.sub, dto);
  }

  @Get('reviews')
  @RequireOtpVerified()
  listReviews(@Query() query: ReviewsQueryDto): Promise<ReviewsListResponseDto> {
    return this.reviewsService.listReviews(query);
  }
}
