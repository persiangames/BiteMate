import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { CoinbaseCommerceService } from './coinbase.service';
import { CryptoController } from './crypto.controller';
import { EncryptionService } from './encryption.service';
import { EscrowController } from './escrow.controller';
import { EscrowService } from './escrow.service';
import { FraudLogService } from './fraud-log.service';
import { StripeService } from './stripe.service';
import { WalletCacheService } from './wallet-cache.service';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [NotificationsModule],
  controllers: [WalletController, CryptoController, EscrowController, WebhooksController],
  providers: [
    WalletService,
    EscrowService,
    EncryptionService,
    FraudLogService,
    WalletCacheService,
    StripeService,
    CoinbaseCommerceService,
  ],
  exports: [WalletService, EscrowService, FraudLogService],
})
export class WalletModule {}
