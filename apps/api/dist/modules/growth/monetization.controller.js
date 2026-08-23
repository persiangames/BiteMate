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
exports.MonetizationController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const auth_decorators_2 = require("../../common/decorators/auth.decorators");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const otp_verified_guard_1 = require("../../common/guards/otp-verified.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const growth_dto_1 = require("./dto/growth.dto");
const monetization_service_1 = require("./monetization.service");
let MonetizationController = class MonetizationController {
    monetizationService;
    constructor(monetizationService) {
        this.monetizationService = monetizationService;
    }
    createAd(user, dto) {
        return this.monetizationService.createRestaurantAd(user.sub, dto);
    }
    listMyAds(user) {
        return this.monetizationService.listRestaurantAds(user.sub);
    }
    listActiveAds() {
        return this.monetizationService.listActiveAds();
    }
    recordImpression(adId) {
        return this.monetizationService.recordAdImpression(adId).then(() => ({ recorded: true }));
    }
    recordClick(adId, dto) {
        return this.monetizationService
            .recordAdClick(adId, dto.referrerUserId)
            .then(() => ({ recorded: true }));
    }
    listCommissions(user) {
        return this.monetizationService.listAffiliateCommissions(user.sub);
    }
};
exports.MonetizationController = MonetizationController;
__decorate([
    (0, common_1.Post)('restaurant-ads'),
    (0, auth_decorators_2.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, growth_dto_1.CreateRestaurantAdDto]),
    __metadata("design:returntype", Promise)
], MonetizationController.prototype, "createAd", null);
__decorate([
    (0, common_1.Get)('restaurant-ads/mine'),
    (0, auth_decorators_2.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonetizationController.prototype, "listMyAds", null);
__decorate([
    (0, auth_decorators_1.Public)(),
    (0, common_1.Get)('restaurant-ads/active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonetizationController.prototype, "listActiveAds", null);
__decorate([
    (0, auth_decorators_1.Public)(),
    (0, common_1.Post)('restaurant-ads/:id/impression'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MonetizationController.prototype, "recordImpression", null);
__decorate([
    (0, auth_decorators_1.Public)(),
    (0, common_1.Post)('restaurant-ads/:id/click'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, growth_dto_1.AdClickDto]),
    __metadata("design:returntype", Promise)
], MonetizationController.prototype, "recordClick", null);
__decorate([
    (0, common_1.Get)('affiliate/commissions'),
    (0, auth_decorators_2.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonetizationController.prototype, "listCommissions", null);
exports.MonetizationController = MonetizationController = __decorate([
    (0, common_1.Controller)('monetization'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, otp_verified_guard_1.OtpVerifiedGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [monetization_service_1.MonetizationService])
], MonetizationController);
//# sourceMappingURL=monetization.controller.js.map