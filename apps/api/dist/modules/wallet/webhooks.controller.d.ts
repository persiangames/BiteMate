import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { WalletService } from './wallet.service';
import { StripeService } from './stripe.service';
export declare class WebhooksController {
    private readonly stripeService;
    private readonly walletService;
    constructor(stripeService: StripeService, walletService: WalletService);
    handleStripe(req: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
    }>;
    handleCoinbase(): {
        received: boolean;
    };
}
