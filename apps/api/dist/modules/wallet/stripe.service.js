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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var StripeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = __importDefault(require("stripe"));
const environment_util_1 = require("../../common/utils/environment.util");
let StripeService = StripeService_1 = class StripeService {
    configService;
    logger = new common_1.Logger(StripeService_1.name);
    stripe;
    production;
    constructor(configService) {
        this.configService = configService;
        this.production = (0, environment_util_1.isProductionEnv)(this.configService.get('app.nodeEnv'));
        const secretKey = this.configService.get('wallet.stripeSecretKey');
        this.stripe = secretKey ? new stripe_1.default(secretKey) : null;
        if (!this.stripe && !this.production) {
            this.logger.warn('Stripe not configured — mock mode enabled for development only');
        }
        if (!this.stripe && this.production) {
            throw new Error('STRIPE_SECRET_KEY is required in production');
        }
    }
    isConfigured() {
        return this.stripe !== null;
    }
    async createDepositIntent(params) {
        if (!this.stripe) {
            if (this.production) {
                throw new common_1.ServiceUnavailableException('Stripe payments are not configured');
            }
            return {
                clientSecret: null,
                paymentIntentId: `mock_pi_${params.userId}_${Date.now()}`,
                mock: true,
            };
        }
        const intent = await this.stripe.paymentIntents.create({
            amount: params.amountCents,
            currency: params.currency.toLowerCase(),
            automatic_payment_methods: { enabled: true },
            metadata: {
                userId: params.userId,
                ...params.metadata,
            },
        });
        return {
            clientSecret: intent.client_secret,
            paymentIntentId: intent.id,
            mock: false,
        };
    }
    constructWebhookEvent(payload, signature) {
        if (!this.stripe) {
            return null;
        }
        const webhookSecret = this.configService.get('wallet.stripeWebhookSecret');
        if (!webhookSecret) {
            return null;
        }
        return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = StripeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map