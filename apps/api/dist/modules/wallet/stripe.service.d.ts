import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
export interface StripeDepositResult {
    clientSecret: string | null;
    paymentIntentId: string;
    mock: boolean;
}
export declare class StripeService {
    private readonly configService;
    private readonly logger;
    private readonly stripe;
    private readonly production;
    constructor(configService: ConfigService);
    isConfigured(): boolean;
    createDepositIntent(params: {
        amountCents: number;
        currency: string;
        userId: string;
        metadata?: Record<string, string>;
    }): Promise<StripeDepositResult>;
    constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event | null;
}
