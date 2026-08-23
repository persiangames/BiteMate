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
exports.CryptoController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const otp_verified_guard_1 = require("../../common/guards/otp-verified.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const wallet_dto_1 = require("./dto/wallet.dto");
const wallet_service_1 = require("./wallet.service");
let CryptoController = class CryptoController {
    walletService;
    constructor(walletService) {
        this.walletService = walletService;
    }
    listAddresses(user) {
        return this.walletService.listCryptoAddresses(user.sub);
    }
    withdraw(user, dto, req) {
        return this.walletService.cryptoWithdraw(user.sub, dto, {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
    }
};
exports.CryptoController = CryptoController;
__decorate([
    (0, common_1.Get)('crypto/addresses'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CryptoController.prototype, "listAddresses", null);
__decorate([
    (0, common_1.Post)('crypto/withdraw'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, wallet_dto_1.CryptoWithdrawDto, Object]),
    __metadata("design:returntype", Promise)
], CryptoController.prototype, "withdraw", null);
exports.CryptoController = CryptoController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, otp_verified_guard_1.OtpVerifiedGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [wallet_service_1.WalletService])
], CryptoController);
//# sourceMappingURL=crypto.controller.js.map