import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { WalletModule } from '../wallet/wallet.module';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';
import { MonetizationController } from './monetization.controller';
import { MonetizationService } from './monetization.service';
import { PremiumController } from './premium.controller';
import { PremiumService } from './premium.service';
import { RankingCacheService } from './ranking-cache.service';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';

@Module({
  imports: [NotificationsModule, WalletModule],
  controllers: [RankingController, PremiumController, MonetizationController, GamificationController],
  providers: [
    RankingService,
    RankingCacheService,
    PremiumService,
    MonetizationService,
    GamificationService,
  ],
  exports: [RankingService, PremiumService, MonetizationService, GamificationService],
})
export class GrowthModule {}
