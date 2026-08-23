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
exports.WalletController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const otp_verified_guard_1 = require("../../common/guards/otp-verified.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const wallet_dto_1 = require("./dto/wallet.dto");
const wallet_service_1 = require("./wallet.service");
function requestContext(req) {
    return {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
    };
}
let WalletController = class WalletController {
    walletService;
    constructor(walletService) {
        this.walletService = walletService;
    }
    getBalance(user) {
        return this.walletService.getBalance(user.sub);
    }
    deposit(user, dto, req) {
        return this.walletService.deposit(user.sub, dto, requestContext(req));
    }
    withdraw(user, dto, req) {
        return this.walletService.withdraw(user.sub, dto, requestContext(req));
    }
    transfer(user, dto, req) {
        return this.walletService.transfer(user.sub, dto, requestContext(req));
    }
    listTransactions(user, query) {
        return this.walletService.listTransactions(user.sub, query.cursor, query.limit);
    }
    listBankAccounts(user) {
        return this.walletService.listBankAccounts(user.sub);
    }
    addBankAccount(user, dto) {
        return this.walletService.addBankAccount(user.sub, dto);
    }
    verifyBankAccount(user, bankAccountId, dto) {
        return this.walletService.verifyBankAccount(user.sub, bankAccountId, dto);
    }
    setDefaultBankAccount(user, bankAccountId) {
        return this.walletService.setDefaultBankAccount(user.sub, bankAccountId);
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Get)('wallet/balance'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Post)('wallet/deposit'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, wallet_dto_1.DepositDto, Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "deposit", null);
__decorate([
    (0, common_1.Post)('wallet/withdraw'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, wallet_dto_1.WithdrawDto, Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "withdraw", null);
__decorate([
    (0, common_1.Post)('wallet/transfer'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, wallet_dto_1.TransferDto, Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "transfer", null);
__decorate([
    (0, common_1.Get)('wallet/transactions'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, wallet_dto_1.TransactionsQueryDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "listTransactions", null);
__decorate([
    (0, common_1.Get)('wallet/bank-accounts'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "listBankAccounts", null);
__decorate([
    (0, common_1.Post)('wallet/bank-accounts'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, wallet_dto_1.CreateBankAccountDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "addBankAccount", null);
__decorate([
    (0, common_1.Post)('wallet/bank-accounts/:id/verify'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, wallet_dto_1.VerifyBankAccountDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "verifyBankAccount", null);
__decorate([
    (0, common_1.Patch)('wallet/bank-accounts/:id/default'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "setDefaultBankAccount", null);
exports.WalletController = WalletController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, otp_verified_guard_1.OtpVerifiedGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [wallet_service_1.WalletService])
], WalletController);
//# sourceMappingURL=wallet.controller.js.map