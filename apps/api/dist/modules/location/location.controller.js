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
exports.NearbyUsersController = exports.LocationController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const otp_verified_guard_1 = require("../../common/guards/otp-verified.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const location_dto_1 = require("./dto/location.dto");
const location_service_1 = require("./location.service");
let LocationController = class LocationController {
    locationService;
    constructor(locationService) {
        this.locationService = locationService;
    }
    updateLiveLocation(user, dto) {
        return this.locationService.updateLiveLocation(user.sub, dto);
    }
};
exports.LocationController = LocationController;
__decorate([
    (0, common_1.Post)('live'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, location_dto_1.UpdateLiveLocationDto]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "updateLiveLocation", null);
exports.LocationController = LocationController = __decorate([
    (0, common_1.Controller)('location'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, otp_verified_guard_1.OtpVerifiedGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [location_service_1.LocationService])
], LocationController);
let NearbyUsersController = class NearbyUsersController {
    locationService;
    constructor(locationService) {
        this.locationService = locationService;
    }
    findNearby(user, query) {
        return this.locationService.findNearbyUsers(user.sub, query);
    }
};
exports.NearbyUsersController = NearbyUsersController;
__decorate([
    (0, common_1.Get)('nearby'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, location_dto_1.NearbyUsersQueryDto]),
    __metadata("design:returntype", Promise)
], NearbyUsersController.prototype, "findNearby", null);
exports.NearbyUsersController = NearbyUsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, otp_verified_guard_1.OtpVerifiedGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [location_service_1.LocationService])
], NearbyUsersController);
//# sourceMappingURL=location.controller.js.map