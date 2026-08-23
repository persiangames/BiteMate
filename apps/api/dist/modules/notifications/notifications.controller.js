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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const otp_verified_guard_1 = require("../../common/guards/otp-verified.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const notifications_dto_1 = require("./dto/notifications.dto");
const notifications_service_1 = require("./notifications.service");
let NotificationsController = class NotificationsController {
    notificationsService;
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    sendNotification(user, dto, sendSecret) {
        return this.notificationsService.send(user.sub, dto, sendSecret);
    }
    listNotifications(user, query) {
        return this.notificationsService.listNotifications(user.sub, query.cursor);
    }
    updateSettings(user, dto) {
        return this.notificationsService.updateSettings(user.sub, dto);
    }
    getSettings(user) {
        return this.notificationsService.getSettings(user.sub);
    }
    markRead(user, dto) {
        return this.notificationsService.markRead(user.sub, dto.notificationId);
    }
    markAllRead(user) {
        return this.notificationsService.markAllRead(user.sub);
    }
    registerDevice(user, dto) {
        return this.notificationsService
            .registerDeviceToken(user.sub, dto.token, dto.platform ?? 'web')
            .then(() => ({ registered: true }));
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Post)('notifications/send'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-notification-secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, notifications_dto_1.SendNotificationDto, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendNotification", null);
__decorate([
    (0, common_1.Get)('notifications'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, notifications_dto_1.NotificationListQueryDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "listNotifications", null);
__decorate([
    (0, common_1.Put)('notifications/settings'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, notifications_dto_1.UpdateNotificationSettingsDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Get)('notifications/settings'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Post)('notifications/read'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, notifications_dto_1.MarkNotificationReadDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markRead", null);
__decorate([
    (0, common_1.Post)('notifications/read-all'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAllRead", null);
__decorate([
    (0, common_1.Post)('notifications/devices'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, notifications_dto_1.RegisterDeviceTokenDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "registerDevice", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, otp_verified_guard_1.OtpVerifiedGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map