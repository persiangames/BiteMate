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
var CoinbaseCommerceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinbaseCommerceService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const node_crypto_1 = require("node:crypto");
const environment_util_1 = require("../../common/utils/environment.util");
let CoinbaseCommerceService = CoinbaseCommerceService_1 = class CoinbaseCommerceService {
    configService;
    logger = new common_1.Logger(CoinbaseCommerceService_1.name);
    apiKey;
    production;
    baseUrl = 'https://api.commerce.coinbase.com';
    constructor(configService) {
        this.configService = configService;
        this.production = (0, environment_util_1.isProductionEnv)(this.configService.get('app.nodeEnv'));
        this.apiKey = this.configService.get('wallet.coinbaseApiKey');
        if (!this.apiKey && !this.production) {
            this.logger.warn('Coinbase Commerce not configured — mock mode for development only');
        }
        if (!this.apiKey && this.production) {
            throw new Error('COINBASE_COMMERCE_API_KEY is required in production');
        }
    }
    isConfigured() {
        return Boolean(this.apiKey);
    }
    generateMockAddress(userId, asset) {
        if (this.production) {
            throw new common_1.ServiceUnavailableException('Coinbase Commerce must be configured for crypto deposit addresses in production');
        }
        const digest = (0, node_crypto_1.createHash)('sha256').update(`${userId}:${asset}:bitemate`).digest('hex');
        switch (asset) {
            case 'BTC':
                return `bc1q${digest.slice(0, 38)}`;
            case 'ETH':
            case 'USDT':
            case 'USDC':
                return `0x${digest.slice(0, 40)}`;
            case 'DOGE':
                return `D${digest.slice(0, 33).toUpperCase()}`;
            case 'SOL':
                return digest.slice(0, 44);
            default:
                return digest.slice(0, 42);
        }
    }
    async createDepositCharge(params) {
        if (!this.apiKey) {
            if (this.production) {
                throw new common_1.ServiceUnavailableException('Coinbase Commerce is not configured');
            }
            return {
                chargeId: `mock_charge_${params.userId}_${params.asset}`,
                hostedUrl: null,
                mock: true,
            };
        }
        const response = await fetch(`${this.baseUrl}/charges`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CC-Api-Key': this.apiKey,
                'X-CC-Version': '2018-03-22',
            },
            body: JSON.stringify({
                name: `BiteMate ${params.asset} deposit`,
                description: `Crypto deposit for user ${params.userId}`,
                pricing_type: 'fixed_price',
                local_price: { amount: params.amountUsd.toFixed(2), currency: 'USD' },
                metadata: { userId: params.userId, asset: params.asset },
            }),
        });
        if (!response.ok) {
            throw new Error(`Coinbase charge failed: ${response.status}`);
        }
        const body = (await response.json());
        return {
            chargeId: body.data.id,
            hostedUrl: body.data.hosted_url,
            mock: false,
        };
    }
};
exports.CoinbaseCommerceService = CoinbaseCommerceService;
exports.CoinbaseCommerceService = CoinbaseCommerceService = CoinbaseCommerceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CoinbaseCommerceService);
//# sourceMappingURL=coinbase.service.js.map