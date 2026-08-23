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
exports.WebhooksController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const wallet_service_1 = require("./wallet.service");
const stripe_service_1 = require("./stripe.service");
let WebhooksController = class WebhooksController {
    stripeService;
    walletService;
    constructor(stripeService, walletService) {
        this.stripeService = stripeService;
        this.walletService = walletService;
    }
    async handleStripe(req, signature) {
        const payload = req.rawBody;
        if (!payload || !signature) {
            return { received: false };
        }
        const event = this.stripeService.constructWebhookEvent(payload, signature);
        if (!event) {
            return { received: false };
        }
        if (event.type === 'payment_intent.succeeded') {
            const intent = event.data.object;
            const userId = intent.metadata?.userId;
            if (userId) {
                await this.walletService.completeStripeDeposit(intent.id, userId);
            }
        }
        return { received: true };
    }
    handleCoinbase() {
        return { received: true };
    }
};
exports.WebhooksController = WebhooksController;
__decorate([
    (0, auth_decorators_1.Public)(),
    (0, common_1.Post)('stripe'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "handleStripe", null);
__decorate([
    (0, auth_decorators_1.Public)(),
    (0, common_1.Post)('coinbase'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], WebhooksController.prototype, "handleCoinbase", null);
exports.WebhooksController = WebhooksController = __decorate([
    (0, throttler_1.SkipThrottle)(),
    (0, common_1.Controller)('webhooks'),
    __metadata("design:paramtypes", [stripe_service_1.StripeService,
        wallet_service_1.WalletService])
], WebhooksController);
//# sourceMappingURL=webhooks.controller.js.map