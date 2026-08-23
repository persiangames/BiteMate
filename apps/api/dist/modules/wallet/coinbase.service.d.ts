import { ConfigService } from '@nestjs/config';
import type { CryptoAsset } from '@bitemate/shared';
export interface CoinbaseChargeResult {
    chargeId: string;
    hostedUrl: string | null;
    mock: boolean;
}
export declare class CoinbaseCommerceService {
    private readonly configService;
    private readonly logger;
    private readonly apiKey;
    private readonly production;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    isConfigured(): boolean;
    generateMockAddress(userId: string, asset: CryptoAsset): string;
    createDepositCharge(params: {
        userId: string;
        asset: CryptoAsset;
        amountUsd: number;
    }): Promise<CoinbaseChargeResult>;
}
