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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const admin_service_1 = require("./admin.service");
const admin_dto_1 = require("./dto/admin.dto");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    getMe(user) {
        return this.adminService.getMe(user.sub);
    }
    getAnalytics(user) {
        this.adminService.assertPermission(user.role, 'analytics');
        return this.adminService.getAnalytics();
    }
    getAudit(user) {
        this.adminService.assertPermission(user.role, 'analytics');
        return this.adminService.recentAuditLogs();
    }
    listUsers(user, query) {
        this.adminService.assertPermission(user.role, 'users');
        return this.adminService.listUsers(query);
    }
    banUser(user, userId, dto) {
        this.adminService.assertPermission(user.role, 'users');
        return this.adminService.setUserBanned(user.sub, user.role, userId, dto.banned, dto.reason);
    }
    verifyUser(user, userId, dto) {
        this.adminService.assertPermission(user.role, 'users');
        return this.adminService.setUserVerified(user.sub, userId, dto.verified);
    }
    listRestaurants(user, query) {
        this.adminService.assertPermission(user.role, 'restaurants');
        return this.adminService.listRestaurants(query);
    }
    updateRestaurant(user, restaurantId, dto) {
        this.adminService.assertPermission(user.role, 'restaurants');
        return this.adminService.updateRestaurantListing(user.sub, restaurantId, dto);
    }
    listTransactions(user, query) {
        this.adminService.assertPermission(user.role, 'finance');
        return this.adminService.listTransactions(query);
    }
    listPayouts(user, query) {
        this.adminService.assertPermission(user.role, 'finance');
        return this.adminService.listPayouts(query);
    }
    listCommissions(user, query) {
        this.adminService.assertPermission(user.role, 'finance');
        return this.adminService.listCommissions(query);
    }
    updateCommission(user, commissionId, dto) {
        this.adminService.assertPermission(user.role, 'finance');
        return this.adminService.updateCommissionStatus(user.sub, commissionId, dto.status);
    }
    listReports(user, query) {
        this.adminService.assertPermission(user.role, 'reports');
        return this.adminService.listAbuseReports(query);
    }
    updateReport(user, reportId, dto) {
        this.adminService.assertPermission(user.role, 'reports');
        return this.adminService.updateAbuseReport(user.sub, reportId, dto.status, dto.resolutionNote);
    }
    listFraud(user, query) {
        this.adminService.assertPermission(user.role, 'reports');
        return this.adminService.listFraudLogs(query);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getMe", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('audit'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAudit", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_dto_1.AdminUsersQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Patch)('users/:id/ban'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_dto_1.BanUserDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "banUser", null);
__decorate([
    (0, common_1.Patch)('users/:id/verify'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_dto_1.VerifyUserDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "verifyUser", null);
__decorate([
    (0, common_1.Get)('restaurants'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_dto_1.AdminRestaurantsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listRestaurants", null);
__decorate([
    (0, common_1.Patch)('restaurants/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_dto_1.UpdateRestaurantListingDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateRestaurant", null);
__decorate([
    (0, common_1.Get)('finance/transactions'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_dto_1.AdminTransactionsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listTransactions", null);
__decorate([
    (0, common_1.Get)('finance/payouts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_dto_1.AdminListQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listPayouts", null);
__decorate([
    (0, common_1.Get)('finance/commissions'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_dto_1.AdminListQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listCommissions", null);
__decorate([
    (0, common_1.Patch)('finance/commissions/:id'),
    (0, auth_decorators_1.Roles)('PLATFORM_ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_dto_1.UpdateCommissionStatusDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateCommission", null);
__decorate([
    (0, common_1.Get)('reports'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_dto_1.AdminReportsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listReports", null);
__decorate([
    (0, common_1.Patch)('reports/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_dto_1.UpdateAbuseReportDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateReport", null);
__decorate([
    (0, common_1.Get)('fraud'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_dto_1.AdminFraudQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listFraud", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, auth_decorators_1.Roles)('PLATFORM_ADMIN', 'MODERATOR'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map