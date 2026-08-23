"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletModule = void 0;
const common_1 = require("@nestjs/common");
const notifications_module_1 = require("../notifications/notifications.module");
const coinbase_service_1 = require("./coinbase.service");
const crypto_controller_1 = require("./crypto.controller");
const encryption_service_1 = require("./encryption.service");
const escrow_controller_1 = require("./escrow.controller");
const escrow_service_1 = require("./escrow.service");
const fraud_log_service_1 = require("./fraud-log.service");
const stripe_service_1 = require("./stripe.service");
const wallet_cache_service_1 = require("./wallet-cache.service");
const wallet_controller_1 = require("./wallet.controller");
const wallet_service_1 = require("./wallet.service");
const webhooks_controller_1 = require("./webhooks.controller");
let WalletModule = class WalletModule {
};
exports.WalletModule = WalletModule;
exports.WalletModule = WalletModule = __decorate([
    (0, common_1.Module)({
        imports: [notifications_module_1.NotificationsModule],
        controllers: [wallet_controller_1.WalletController, crypto_controller_1.CryptoController, escrow_controller_1.EscrowController, webhooks_controller_1.WebhooksController],
        providers: [
            wallet_service_1.WalletService,
            escrow_service_1.EscrowService,
            encryption_service_1.EncryptionService,
            fraud_log_service_1.FraudLogService,
            wallet_cache_service_1.WalletCacheService,
            stripe_service_1.StripeService,
            coinbase_service_1.CoinbaseCommerceService,
        ],
        exports: [wallet_service_1.WalletService, escrow_service_1.EscrowService, fraud_log_service_1.FraudLogService],
    })
], WalletModule);
//# sourceMappingURL=wallet.module.js.map