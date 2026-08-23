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
exports.RankingController = void 0;
const common_1 = require("@nestjs/common");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const otp_verified_guard_1 = require("../../common/guards/otp-verified.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const growth_dto_1 = require("./dto/growth.dto");
const ranking_service_1 = require("./ranking.service");
let RankingController = class RankingController {
    rankingService;
    constructor(rankingService) {
        this.rankingService = rankingService;
    }
    getUserRankings(query) {
        return this.rankingService.getUserRankings(query);
    }
    getRestaurantRankings(query) {
        return this.rankingService.getRestaurantRankings(query);
    }
};
exports.RankingController = RankingController;
__decorate([
    (0, auth_decorators_1.Public)(),
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [growth_dto_1.RankingsQueryDto]),
    __metadata("design:returntype", Promise)
], RankingController.prototype, "getUserRankings", null);
__decorate([
    (0, auth_decorators_1.Public)(),
    (0, common_1.Get)('restaurants'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [growth_dto_1.RankingsQueryDto]),
    __metadata("design:returntype", Promise)
], RankingController.prototype, "getRestaurantRankings", null);
exports.RankingController = RankingController = __decorate([
    (0, common_1.Controller)('ranking'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, otp_verified_guard_1.OtpVerifiedGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [ranking_service_1.RankingService])
], RankingController);
//# sourceMappingURL=ranking.controller.js.map