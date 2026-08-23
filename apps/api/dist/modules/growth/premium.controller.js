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
exports.PremiumController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const otp_verified_guard_1 = require("../../common/guards/otp-verified.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const growth_dto_1 = require("./dto/growth.dto");
const premium_service_1 = require("./premium.service");
const ranking_service_1 = require("./ranking.service");
let PremiumController = class PremiumController {
    premiumService;
    rankingService;
    constructor(premiumService, rankingService) {
        this.premiumService = premiumService;
        this.rankingService = rankingService;
    }
    getStatus(user) {
        return this.premiumService.getStatus(user.sub);
    }
    async subscribe(user, dto) {
        const result = await this.premiumService.subscribe(user.sub, dto);
        await this.rankingService.refreshUserRank(user.sub);
        return result;
    }
};
exports.PremiumController = PremiumController;
__decorate([
    (0, common_1.Get)('status'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PremiumController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('subscribe'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, growth_dto_1.PremiumSubscribeDto]),
    __metadata("design:returntype", Promise)
], PremiumController.prototype, "subscribe", null);
exports.PremiumController = PremiumController = __decorate([
    (0, common_1.Controller)('premium'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, otp_verified_guard_1.OtpVerifiedGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [premium_service_1.PremiumService,
        ranking_service_1.RankingService])
], PremiumController);
//# sourceMappingURL=premium.controller.js.map