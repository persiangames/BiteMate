import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SentryModule } from '@sentry/nestjs/setup';
import { AppConfigModule } from './config/config.module';
import { AppThrottlerGuard } from './common/guards/app-throttler.guard';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { OtpVerifiedGuard } from './common/guards/otp-verified.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { I18nModule } from './modules/i18n/i18n.module';
import { LocationModule } from './modules/location/location.module';
import { MediaModule } from './modules/media/media.module';
import { PostsModule } from './modules/posts/posts.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { MeetupsModule } from './modules/meetups/meetups.module';
import { IntentModule } from './modules/intent/intent.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MongoModule } from './modules/database/mongo.module';
import { PrismaModule } from './modules/database/prisma.module';
import { ChatModule } from './modules/chat/chat.module';
import { RedisModule } from './modules/redis/redis.module';
import { RedisThrottlerStorage } from './modules/redis/redis-throttler.storage';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { UsersModule } from './modules/users/users.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { GrowthModule } from './modules/growth/growth.module';
import { AdminModule } from './modules/admin/admin.module';
import { SecurityModule } from './modules/security/security.module';

const skipMongo = process.env.SKIP_MONGO === 'true';

@Module({
  imports: [
    AppConfigModule,
    SentryModule.forRoot(),
    PrismaModule,
    ...(skipMongo ? [] : [MongoModule]),
    RedisModule,
    SecurityModule,
    ThrottlerModule.forRootAsync({
      imports: [RedisModule],
      inject: [ConfigService, RedisThrottlerStorage],
      useFactory: (configService: ConfigService, storage: RedisThrottlerStorage) => ({
        storage,
        throttlers: [
          {
            name: 'default',
            ttl: configService.get<number>('security.throttleTtlSeconds', 60)! * 1000,
            limit: configService.get<number>('security.throttleLimit', 120)!,
            blockDuration: 30_000,
          },
          {
            name: 'auth',
            ttl: configService.get<number>('security.authThrottleTtlSeconds', 60)! * 1000,
            limit: configService.get<number>('security.authThrottleLimit', 8)!,
            blockDuration: 60_000,
            skipIf: (context) => {
              if (context.getType() !== 'http') {
                return true;
              }
              const request = context.switchToHttp().getRequest<{ originalUrl?: string; url?: string }>();
              const url = request.originalUrl ?? request.url ?? '';
              return !url.includes('/auth/');
            },
          },
        ],
      }),
    }),
    AuthModule,
    UsersModule,
    LocationModule,
    MediaModule,
    PostsModule,
    MarketplaceModule,
    MeetupsModule,
    IntentModule,
    NotificationsModule,
    ...(skipMongo ? [] : [ChatModule]),
    WalletModule,
    GrowthModule,
    AdminModule,
    I18nModule,
    HealthModule,
    RealtimeModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: AppThrottlerGuard },
    { provide: APP_GUARD, useClass: OtpVerifiedGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
