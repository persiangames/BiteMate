"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const config_1 = require("@nestjs/config");
const setup_1 = require("@sentry/nestjs/setup");
const config_module_1 = require("./config/config.module");
const app_throttler_guard_1 = require("./common/guards/app-throttler.guard");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const otp_verified_guard_1 = require("./common/guards/otp-verified.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const request_id_middleware_1 = require("./common/middleware/request-id.middleware");
const auth_module_1 = require("./modules/auth/auth.module");
const health_module_1 = require("./modules/health/health.module");
const i18n_module_1 = require("./modules/i18n/i18n.module");
const location_module_1 = require("./modules/location/location.module");
const media_module_1 = require("./modules/media/media.module");
const posts_module_1 = require("./modules/posts/posts.module");
const marketplace_module_1 = require("./modules/marketplace/marketplace.module");
const meetups_module_1 = require("./modules/meetups/meetups.module");
const intent_module_1 = require("./modules/intent/intent.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const mongo_module_1 = require("./modules/database/mongo.module");
const prisma_module_1 = require("./modules/database/prisma.module");
const chat_module_1 = require("./modules/chat/chat.module");
const redis_module_1 = require("./modules/redis/redis.module");
const redis_throttler_storage_1 = require("./modules/redis/redis-throttler.storage");
const realtime_module_1 = require("./modules/realtime/realtime.module");
const users_module_1 = require("./modules/users/users.module");
const wallet_module_1 = require("./modules/wallet/wallet.module");
const growth_module_1 = require("./modules/growth/growth.module");
const admin_module_1 = require("./modules/admin/admin.module");
const security_module_1 = require("./modules/security/security.module");
const skipMongo = process.env.SKIP_MONGO === 'true';
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(request_id_middleware_1.RequestIdMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.AppConfigModule,
            setup_1.SentryModule.forRoot(),
            prisma_module_1.PrismaModule,
            ...(skipMongo ? [] : [mongo_module_1.MongoModule]),
            redis_module_1.RedisModule,
            security_module_1.SecurityModule,
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [redis_module_1.RedisModule],
                inject: [config_1.ConfigService, redis_throttler_storage_1.RedisThrottlerStorage],
                useFactory: (configService, storage) => ({
                    storage,
                    throttlers: [
                        {
                            name: 'default',
                            ttl: configService.get('security.throttleTtlSeconds', 60) * 1000,
                            limit: configService.get('security.throttleLimit', 120),
                            blockDuration: 30_000,
                        },
                        {
                            name: 'auth',
                            ttl: configService.get('security.authThrottleTtlSeconds', 60) * 1000,
                            limit: configService.get('security.authThrottleLimit', 8),
                            blockDuration: 60_000,
                            skipIf: (context) => {
                                if (context.getType() !== 'http') {
                                    return true;
                                }
                                const request = context.switchToHttp().getRequest();
                                const url = request.originalUrl ?? request.url ?? '';
                                return !url.includes('/auth/');
                            },
                        },
                    ],
                }),
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            location_module_1.LocationModule,
            media_module_1.MediaModule,
            posts_module_1.PostsModule,
            marketplace_module_1.MarketplaceModule,
            meetups_module_1.MeetupsModule,
            intent_module_1.IntentModule,
            notifications_module_1.NotificationsModule,
            ...(skipMongo ? [] : [chat_module_1.ChatModule]),
            wallet_module_1.WalletModule,
            growth_module_1.GrowthModule,
            admin_module_1.AdminModule,
            i18n_module_1.I18nModule,
            health_module_1.HealthModule,
            realtime_module_1.RealtimeModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: app_throttler_guard_1.AppThrottlerGuard },
            { provide: core_1.APP_GUARD, useClass: otp_verified_guard_1.OtpVerifiedGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map