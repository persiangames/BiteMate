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
exports.UpdateCommissionStatusDto = exports.CreateAbuseReportDto = exports.UpdateAbuseReportDto = exports.UpdateRestaurantListingDto = exports.VerifyUserDto = exports.BanUserDto = exports.AdminFraudQueryDto = exports.AdminReportsQueryDto = exports.AdminTransactionsQueryDto = exports.AdminRestaurantsQueryDto = exports.AdminUsersQueryDto = exports.AdminListQueryDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const shared_1 = require("@bitemate/shared");
class AdminListQueryDto {
    search;
    page = 1;
    limit = 20;
}
exports.AdminListQueryDto = AdminListQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], AdminListQueryDto.prototype, "search", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Object)
], AdminListQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Object)
], AdminListQueryDto.prototype, "limit", void 0);
class AdminUsersQueryDto extends AdminListQueryDto {
    role;
    isActive;
}
exports.AdminUsersQueryDto = AdminUsersQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminUsersQueryDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === undefined || value === '') {
            return undefined;
        }
        return value === true || value === 'true';
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AdminUsersQueryDto.prototype, "isActive", void 0);
class AdminRestaurantsQueryDto extends AdminListQueryDto {
    approvalStatus;
}
exports.AdminRestaurantsQueryDto = AdminRestaurantsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(shared_1.RESTAURANT_APPROVAL_STATUSES),
    __metadata("design:type", Object)
], AdminRestaurantsQueryDto.prototype, "approvalStatus", void 0);
class AdminTransactionsQueryDto extends AdminListQueryDto {
    type;
    status;
}
exports.AdminTransactionsQueryDto = AdminTransactionsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminTransactionsQueryDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminTransactionsQueryDto.prototype, "status", void 0);
class AdminReportsQueryDto extends AdminListQueryDto {
    status;
}
exports.AdminReportsQueryDto = AdminReportsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(shared_1.ABUSE_REPORT_STATUSES),
    __metadata("design:type", Object)
], AdminReportsQueryDto.prototype, "status", void 0);
class AdminFraudQueryDto extends AdminListQueryDto {
    minRiskScore;
}
exports.AdminFraudQueryDto = AdminFraudQueryDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], AdminFraudQueryDto.prototype, "minRiskScore", void 0);
class BanUserDto {
    banned;
    reason;
}
exports.BanUserDto = BanUserDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BanUserDto.prototype, "banned", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], BanUserDto.prototype, "reason", void 0);
class VerifyUserDto {
    verified;
}
exports.VerifyUserDto = VerifyUserDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], VerifyUserDto.prototype, "verified", void 0);
class UpdateRestaurantListingDto {
    approvalStatus;
    isActive;
}
exports.UpdateRestaurantListingDto = UpdateRestaurantListingDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(shared_1.RESTAURANT_APPROVAL_STATUSES),
    __metadata("design:type", Object)
], UpdateRestaurantListingDto.prototype, "approvalStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateRestaurantListingDto.prototype, "isActive", void 0);
class UpdateAbuseReportDto {
    status;
    resolutionNote;
}
exports.UpdateAbuseReportDto = UpdateAbuseReportDto;
__decorate([
    (0, class_validator_1.IsIn)(shared_1.ABUSE_REPORT_STATUSES),
    __metadata("design:type", Object)
], UpdateAbuseReportDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateAbuseReportDto.prototype, "resolutionNote", void 0);
class CreateAbuseReportDto {
    targetType;
    targetId;
    reason;
    details;
}
exports.CreateAbuseReportDto = CreateAbuseReportDto;
__decorate([
    (0, class_validator_1.IsIn)(shared_1.ABUSE_REPORT_TARGET_TYPES),
    __metadata("design:type", Object)
], CreateAbuseReportDto.prototype, "targetType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAbuseReportDto.prototype, "targetId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateAbuseReportDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateAbuseReportDto.prototype, "details", void 0);
class UpdateCommissionStatusDto {
    status;
}
exports.UpdateCommissionStatusDto = UpdateCommissionStatusDto;
__decorate([
    (0, class_validator_1.IsIn)(['APPROVED', 'PAID', 'REJECTED']),
    __metadata("design:type", String)
], UpdateCommissionStatusDto.prototype, "status", void 0);
//# sourceMappingURL=admin.dto.js.map