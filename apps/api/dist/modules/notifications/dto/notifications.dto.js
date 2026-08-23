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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterDeviceTokenDto = exports.MarkNotificationReadDto = exports.UpdateNotificationSettingsDto = exports.NotificationListQueryDto = exports.SendNotificationDto = void 0;
const class_validator_1 = require("class-validator");
const shared_1 = require("@bitemate/shared");
class SendNotificationDto {
    recipientUserId;
    type;
    title;
    body;
    data;
    entityId;
    dedupeKey;
}
exports.SendNotificationDto = SendNotificationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendNotificationDto.prototype, "recipientUserId", void 0);
__decorate([
    (0, class_validator_1.IsIn)(shared_1.NOTIFICATION_TYPES),
    __metadata("design:type", String)
], SendNotificationDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(160),
    __metadata("design:type", String)
], SendNotificationDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], SendNotificationDto.prototype, "body", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SendNotificationDto.prototype, "data", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendNotificationDto.prototype, "entityId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendNotificationDto.prototype, "dedupeKey", void 0);
class NotificationListQueryDto {
    cursor;
}
exports.NotificationListQueryDto = NotificationListQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NotificationListQueryDto.prototype, "cursor", void 0);
class UpdateNotificationSettingsDto {
    muted;
    disabledTypes;
}
exports.UpdateNotificationSettingsDto = UpdateNotificationSettingsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateNotificationSettingsDto.prototype, "muted", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsIn)(shared_1.NOTIFICATION_TYPES, { each: true }),
    __metadata("design:type", Array)
], UpdateNotificationSettingsDto.prototype, "disabledTypes", void 0);
class MarkNotificationReadDto {
    notificationId;
}
exports.MarkNotificationReadDto = MarkNotificationReadDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MarkNotificationReadDto.prototype, "notificationId", void 0);
class RegisterDeviceTokenDto {
    token;
    platform;
}
exports.RegisterDeviceTokenDto = RegisterDeviceTokenDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(512),
    __metadata("design:type", String)
], RegisterDeviceTokenDto.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['web', 'ios', 'android']),
    __metadata("design:type", String)
], RegisterDeviceTokenDto.prototype, "platform", void 0);
//# sourceMappingURL=notifications.dto.js.map