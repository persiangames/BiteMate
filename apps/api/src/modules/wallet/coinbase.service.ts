import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import type { CryptoAsset } from '@bitemate/shared';
import { isProductionEnv } from '../../common/utils/environment.util';

export interface CoinbaseChargeResult {
  chargeId: string;
  hostedUrl: string | null;
  mock: boolean;
}

@Injectable()
export class CoinbaseCommerceService {
  private readonly logger = new Logger(CoinbaseCommerceService.name);
  private readonly apiKey: string | undefined;
  private readonly production: boolean;
  private readonly baseUrl = 'https://api.commerce.coinbase.com';

  constructor(private readonly configService: ConfigService) {
    this.production = isProductionEnv(this.configService.get<string>('app.nodeEnv'));
    this.apiKey = this.configService.get<string>('wallet.coinbaseApiKey');

    if (!this.apiKey && !this.production) {
      this.logger.warn('Coinbase Commerce not configured — mock mode for development only');
    }
    if (!this.apiKey && this.production) {
      throw new Error('COINBASE_COMMERCE_API_KEY is required in production');
    }
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  generateMockAddress(userId: string, asset: CryptoAsset): string {
    if (this.production) {
      throw new ServiceUnavailableException(
        'Coinbase Commerce must be configured for crypto deposit addresses in production',
      );
    }

    const digest = createHash('sha256').update(`${userId}:${asset}:bitemate`).digest('hex');
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

  async createDepositCharge(params: {
    userId: string;
    asset: CryptoAsset;
    amountUsd: number;
  }): Promise<CoinbaseChargeResult> {
    if (!this.apiKey) {
      if (this.production) {
        throw new ServiceUnavailableException('Coinbase Commerce is not configured');
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

    const body = (await response.json()) as {
      data: { id: string; hosted_url: string };
    };

    return {
      chargeId: body.data.id,
      hostedUrl: body.data.hosted_url,
      mock: false,
    };
  }
}
