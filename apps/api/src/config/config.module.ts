import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration, {
  databaseConfig,
  firebaseConfig,
  jwtConfig,
  locationConfig,
  loggingConfig,
  meetupConfig,
  intentConfig,
  notificationConfig,
  mongoConfig,
  chatConfig,
  otpConfig,
  redisConfig,
  storageConfig,
  walletConfig,
  premiumConfig,
  rankingConfig,
  monetizationConfig,
  adminConfig,
} from './configuration';
import { securityConfig, sentryConfig } from './security.config';
import { envValidationSchema } from './env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [configuration, databaseConfig, loggingConfig, redisConfig, jwtConfig, firebaseConfig, otpConfig, locationConfig, storageConfig, meetupConfig, intentConfig, notificationConfig, mongoConfig, chatConfig, walletConfig, premiumConfig, rankingConfig, monetizationConfig, adminConfig, securityConfig, sentryConfig],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
  ],
})
export class AppConfigModule {}
