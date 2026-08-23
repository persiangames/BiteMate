"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const otp_verified_guard_1 = require("../../common/guards/otp-verified.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const bookings_service_1 = require("./bookings.service");
const marketplace_dto_1 = require("./dto/marketplace.dto");
const home_chef_service_1 = require("./home-chef.service");
const restaurants_service_1 = require("./restaurants.service");
const reviews_service_1 = require("./reviews.service");
let MarketplaceController = class MarketplaceController {
    restaurantsService;
    homeChefService;
    bookingsService;
    reviewsService;
    constructor(restaurantsService, homeChefService, bookingsService, reviewsService) {
        this.restaurantsService = restaurantsService;
        this.homeChefService = homeChefService;
        this.bookingsService = bookingsService;
        this.reviewsService = reviewsService;
    }
    createRestaurant(user, dto) {
        return this.restaurantsService.createRestaurant(user.sub, dto);
    }
    listRestaurants(query) {
        return this.restaurantsService.listRestaurants(query);
    }
    getRestaurant(user, id) {
        return this.restaurantsService.getRestaurant(id, user.sub);
    }
    addRestaurantMenuItem(user, restaurantId, dto) {
        return this.restaurantsService.addMenuItem(user.sub, restaurantId, dto);
    }
    upsertHomeChefProfile(user, dto) {
        return this.homeChefService.upsertProfile(user.sub, dto);
    }
    getMyHomeChefProfile(user) {
        return this.homeChefService.getMyProfile(user.sub);
    }
    listHomeChefs() {
        return this.homeChefService.listHomeChefs();
    }
    getHomeChefProfile(id) {
        return this.homeChefService.getProfile(id);
    }
    createHomeChefMenuItem(user, dto) {
        return this.homeChefService.createMenuItem(user.sub, dto);
    }
    listHomeChefMenuItems(query) {
        return this.homeChefService.listMenuItems(query);
    }
    createBooking(user, dto) {
        return this.bookingsService.createBooking(user.sub, dto);
    }
    listMyBookings(user) {
        return this.bookingsService.listMyBookings(user.sub);
    }
    updateBookingStatus(user, bookingId, dto) {
        return this.bookingsService.updateBookingStatus(user.sub, bookingId, dto);
    }
    createReview(user, dto) {
        return this.reviewsService.createReview(user.sub, dto);
    }
    listReviews(query) {
        return this.reviewsService.listReviews(query);
    }
};
exports.MarketplaceController = MarketplaceController;
__decorate([
    (0, common_1.Post)('restaurants'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    (0, auth_decorators_1.Roles)('RESTAURANT_OWNER'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, marketplace_dto_1.CreateRestaurantDto]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "createRestaurant", null);
__decorate([
    (0, common_1.Get)('restaurants'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [marketplace_dto_1.RestaurantsQueryDto]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "listRestaurants", null);
__decorate([
    (0, common_1.Get)('restaurants/:id'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getRestaurant", null);
__decorate([
    (0, common_1.Post)('restaurants/:id/menu'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    (0, auth_decorators_1.Roles)('RESTAURANT_OWNER'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, marketplace_dto_1.CreateRestaurantMenuItemDto]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "addRestaurantMenuItem", null);
__decorate([
    (0, common_1.Post)('home-chef/profile'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    (0, auth_decorators_1.Roles)('HOME_CHEF'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, marketplace_dto_1.CreateHomeChefProfileDto]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "upsertHomeChefProfile", null);
__decorate([
    (0, common_1.Get)('home-chef/profile/me'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    (0, auth_decorators_1.Roles)('HOME_CHEF'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getMyHomeChefProfile", null);
__decorate([
    (0, common_1.Get)('home-chefs'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "listHomeChefs", null);
__decorate([
    (0, common_1.Get)('home-chef/:id'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getHomeChefProfile", null);
__decorate([
    (0, common_1.Post)('home-chef/menu'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    (0, auth_decorators_1.Roles)('HOME_CHEF'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, marketplace_dto_1.CreateHomeChefMenuDto]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "createHomeChefMenuItem", null);
__decorate([
    (0, common_1.Get)('home-chef/menu'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [marketplace_dto_1.HomeChefMenuQueryDto]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "listHomeChefMenuItems", null);
__decorate([
    (0, common_1.Post)('booking'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, marketplace_dto_1.CreateBookingDto]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "createBooking", null);
__decorate([
    (0, common_1.Get)('bookings/me'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "listMyBookings", null);
__decorate([
    (0, common_1.Patch)('bookings/:id/status'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, marketplace_dto_1.UpdateBookingStatusDto]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "updateBookingStatus", null);
__decorate([
    (0, common_1.Post)('review'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, marketplace_dto_1.CreateReviewDto]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "createReview", null);
__decorate([
    (0, common_1.Get)('reviews'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [marketplace_dto_1.ReviewsQueryDto]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "listReviews", null);
exports.MarketplaceController = MarketplaceController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, otp_verified_guard_1.OtpVerifiedGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [restaurants_service_1.RestaurantsService,
        home_chef_service_1.HomeChefService,
        bookings_service_1.BookingsService,
        reviews_service_1.ReviewsService])
], MarketplaceController);
//# sourceMappingURL=marketplace.controller.js.map