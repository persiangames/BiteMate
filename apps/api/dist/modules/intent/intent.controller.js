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
exports.IntentController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const otp_verified_guard_1 = require("../../common/guards/otp-verified.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const intent_dto_1 = require("./dto/intent.dto");
const intent_service_1 = require("./intent.service");
let IntentController = class IntentController {
    intentService;
    constructor(intentService) {
        this.intentService = intentService;
    }
    createIntent(user, dto) {
        return this.intentService.createIntent(user.sub, dto);
    }
    getMatches(user, query) {
        return this.intentService.getMatches(user.sub, query.intentId);
    }
    cancelIntent(user, dto) {
        return this.intentService.cancelIntent(user.sub, dto.intentId);
    }
    listMyIntents(user) {
        return this.intentService.listMyIntents(user.sub);
    }
    getDailyLimit(user) {
        return this.intentService.getDailyLimit(user.sub);
    }
};
exports.IntentController = IntentController;
__decorate([
    (0, common_1.Post)('intent/create'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, intent_dto_1.CreateIntentDto]),
    __metadata("design:returntype", Promise)
], IntentController.prototype, "createIntent", null);
__decorate([
    (0, common_1.Get)('intent/matches'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, intent_dto_1.IntentMatchQueryDto]),
    __metadata("design:returntype", Promise)
], IntentController.prototype, "getMatches", null);
__decorate([
    (0, common_1.Post)('intent/cancel'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, intent_dto_1.CancelIntentDto]),
    __metadata("design:returntype", Promise)
], IntentController.prototype, "cancelIntent", null);
__decorate([
    (0, common_1.Get)('intent/me'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntentController.prototype, "listMyIntents", null);
__decorate([
    (0, common_1.Get)('intent/limit'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntentController.prototype, "getDailyLimit", null);
exports.IntentController = IntentController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, otp_verified_guard_1.OtpVerifiedGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [intent_service_1.IntentService])
], IntentController);
//# sourceMappingURL=intent.controller.js.map