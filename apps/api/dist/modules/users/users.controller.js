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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const otp_verified_guard_1 = require("../../common/guards/otp-verified.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const auth_dto_1 = require("../auth/dto/auth.dto");
const users_service_1 = require("./users.service");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    getProfile(user) {
        return this.usersService.getProfile(user.sub);
    }
    checkUsername(user, query) {
        return this.usersService.isUsernameAvailable(query.username, user.sub);
    }
    searchUsers(query) {
        return this.usersService.searchUsers(query.q);
    }
    getPublicProfile(user, username) {
        return this.usersService.getPublicProfile(username, user.sub);
    }
    getPublicProfileById(user, userId) {
        return this.usersService.getPublicProfileById(userId, user.sub);
    }
    listMeetupHistory(userId, kind) {
        const resolved = kind === 'attended' ? 'attended' : 'hosted';
        return this.usersService.listMeetupHistory(userId, resolved);
    }
    updateProfilePatch(user, dto) {
        return this.usersService.updateProfile(user.sub, dto);
    }
    updateProfilePut(user, dto) {
        return this.usersService.updateProfile(user.sub, dto);
    }
    requestContactChange(user, dto) {
        return this.usersService.requestContactChange(user.sub, dto);
    }
    verifyContactChange(user, dto) {
        return this.usersService.verifyContactChange(user.sub, dto);
    }
    updateLocale(user, dto) {
        return this.usersService.updateLocale(user.sub, dto);
    }
    updateTheme(user, dto) {
        return this.usersService.updateTheme(user.sub, dto);
    }
    changePassword(user, dto) {
        return this.usersService.changePassword(user.sub, dto);
    }
    setupTwoFactor(user) {
        return this.usersService.setupTwoFactor(user.sub);
    }
    enableTwoFactor(user, dto) {
        return this.usersService.enableTwoFactor(user.sub, dto);
    }
    disableTwoFactor(user, dto) {
        return this.usersService.disableTwoFactor(user.sub, dto);
    }
    requestDelete(user, dto) {
        return this.usersService.requestAccountDeletion(user.sub, dto);
    }
    confirmDelete(user, dto) {
        return this.usersService.confirmAccountDeletion(user.sub, dto);
    }
    fullAccessCheck(user) {
        return { ok: true, userId: user.sub };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('username-available'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.UsernameQueryDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "checkUsername", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.SearchUsersQueryDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "searchUsers", null);
__decorate([
    (0, common_1.Get)('by-username/:username'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getPublicProfile", null);
__decorate([
    (0, common_1.Get)('id/:userId/public'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getPublicProfileById", null);
__decorate([
    (0, common_1.Get)('id/:userId/meetups'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('kind')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "listMeetupHistory", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfilePatch", null);
__decorate([
    (0, common_1.Put)('me'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfilePut", null);
__decorate([
    (0, common_1.Post)('me/contact/request'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.RequestContactChangeDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "requestContactChange", null);
__decorate([
    (0, common_1.Post)('me/contact/verify'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.VerifyContactChangeDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "verifyContactChange", null);
__decorate([
    (0, common_1.Patch)('me/locale'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.UpdateLocaleDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateLocale", null);
__decorate([
    (0, common_1.Patch)('me/theme'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.UpdateThemeDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateTheme", null);
__decorate([
    (0, common_1.Post)('me/password'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('me/2fa/setup'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "setupTwoFactor", null);
__decorate([
    (0, common_1.Post)('me/2fa/enable'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.EnableTwoFactorDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "enableTwoFactor", null);
__decorate([
    (0, common_1.Post)('me/2fa/disable'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.DisableTwoFactorDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "disableTwoFactor", null);
__decorate([
    (0, common_1.Post)('me/delete/request'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.DeleteAccountRequestDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "requestDelete", null);
__decorate([
    (0, common_1.Post)('me/delete/confirm'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.DeleteAccountConfirmDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "confirmDelete", null);
__decorate([
    (0, common_1.Get)('me/full-access-check'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], UsersController.prototype, "fullAccessCheck", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, otp_verified_guard_1.OtpVerifiedGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map