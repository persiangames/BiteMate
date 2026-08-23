import { Controller, Headers, Post, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/auth.decorators';
import { WalletService } from './wallet.service';
import { StripeService } from './stripe.service';

@SkipThrottle()
@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly walletService: WalletService,
  ) {}

  @Public()
  @Post('stripe')
  async handleStripe(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    const payload = req.rawBody;
    if (!payload || !signature) {
      return { received: false };
    }

    const event = this.stripeService.constructWebhookEvent(payload, signature);
    if (!event) {
      return { received: false };
    }

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as { id: string; metadata?: { userId?: string } };
      const userId = intent.metadata?.userId;
      if (userId) {
        await this.walletService.completeStripeDeposit(intent.id, userId);
      }
    }

    return { received: true };
  }

  @Public()
  @Post('coinbase')
  handleCoinbase(): { received: boolean } {
    return { received: true };
  }
}
