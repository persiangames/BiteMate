import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { isProductionEnv } from '../../common/utils/environment.util';

export interface StripeDepositResult {
  clientSecret: string | null;
  paymentIntentId: string;
  mock: boolean;
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe | null;
  private readonly production: boolean;

  constructor(private readonly configService: ConfigService) {
    this.production = isProductionEnv(this.configService.get<string>('app.nodeEnv'));
    const secretKey = this.configService.get<string>('wallet.stripeSecretKey');
    this.stripe = secretKey ? new Stripe(secretKey) : null;

    if (!this.stripe && !this.production) {
      this.logger.warn('Stripe not configured — mock mode enabled for development only');
    }
    if (!this.stripe && this.production) {
      throw new Error('STRIPE_SECRET_KEY is required in production');
    }
  }

  isConfigured(): boolean {
    return this.stripe !== null;
  }

  async createDepositIntent(params: {
    amountCents: number;
    currency: string;
    userId: string;
    metadata?: Record<string, string>;
  }): Promise<StripeDepositResult> {
    if (!this.stripe) {
      if (this.production) {
        throw new ServiceUnavailableException('Stripe payments are not configured');
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

  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event | null {
    if (!this.stripe) {
      return null;
    }

    const webhookSecret = this.configService.get<string>('wallet.stripeWebhookSecret');
    if (!webhookSecret) {
      return null;
    }

    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}
