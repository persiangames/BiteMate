import { Global, Module } from '@nestjs/common';
import { WalletModule } from '../wallet/wallet.module';
import { FraudDetectionService } from './fraud-detection.service';

@Global()
@Module({
  imports: [WalletModule],
  providers: [FraudDetectionService],
  exports: [FraudDetectionService],
})
export class SecurityModule {}
