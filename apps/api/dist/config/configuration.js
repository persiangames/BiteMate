"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletConfig = exports.adminConfig = exports.monetizationConfig = exports.rankingConfig = exports.premiumConfig = exports.chatConfig = exports.mongoConfig = exports.notificationConfig = exports.intentConfig = exports.meetupConfig = exports.storageConfig = exports.locationConfig = exports.otpConfig = exports.firebaseConfig = exports.jwtConfig = exports.loggingConfig = exports.redisConfig = exports.databaseConfig = void 0;
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('app', () => ({
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
    apiPrefix: process.env.API_PREFIX ?? 'api',
    corsOrigins: (process.env.CORS_ORIGINS ??
        'http://localhost:5173,http://localhost:3001,https://www.bitemate.ir,https://bitemate.ir')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
}));
exports.databaseConfig = (0, config_1.registerAs)('database', () => ({
    url: process.env.DATABASE_URL,
}));
exports.redisConfig = (0, config_1.registerAs)('redis', () => ({
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB ?? '0', 10),
}));
exports.loggingConfig = (0, config_1.registerAs)('logging', () => ({
    level: process.env.LOG_LEVEL ?? 'info',
}));
exports.jwtConfig = (0, config_1.registerAs)('jwt', () => ({
    secret: process.env.JWT_SECRET ?? 'dev-only-jwt-secret-change-me',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    issuer: process.env.JWT_ISSUER ?? 'bitemate',
    audience: process.env.JWT_AUDIENCE ?? 'bitemate-app',
}));
exports.firebaseConfig = (0, config_1.registerAs)('firebase', () => ({
    projectId: process.env.FIREBASE_PROJECT_ID || undefined,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || undefined,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || undefined,
}));
exports.otpConfig = (0, config_1.registerAs)('otp', () => ({
    expiresInSeconds: parseInt(process.env.OTP_EXPIRES_IN_SECONDS ?? '300', 10),
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS ?? '5', 10),
    skipInDev: process.env.SKIP_OTP_IN_DEV !== 'false',
}));
exports.locationConfig = (0, config_1.registerAs)('location', () => ({
    liveLocationTtlSeconds: parseInt(process.env.LIVE_LOCATION_TTL_SECONDS ?? '300', 10),
    liveLocationUpdateIntervalSeconds: parseInt(process.env.LIVE_LOCATION_UPDATE_INTERVAL_SECONDS ?? '30', 10),
    geoKey: process.env.REDIS_GEO_KEY ?? 'bitemate:geo:live',
}));
exports.storageConfig = (0, config_1.registerAs)('storage', () => ({
    provider: process.env.STORAGE_PROVIDER ?? 'local',
    awsRegion: process.env.AWS_REGION || undefined,
    awsS3Bucket: process.env.AWS_S3_BUCKET || undefined,
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || undefined,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || undefined,
    localUploadDir: process.env.LOCAL_UPLOAD_DIR ?? 'uploads',
    publicBaseUrl: process.env.MEDIA_PUBLIC_BASE_URL ?? 'http://localhost:3000/uploads',
}));
exports.meetupConfig = (0, config_1.registerAs)('meetup', () => ({
    geoKey: process.env.MEETUP_GEO_KEY ?? 'bitemate:meetups:geo',
    metaPrefix: process.env.MEETUP_META_PREFIX ?? 'bitemate:meetups:meta:',
    foodIndexPrefix: process.env.MEETUP_FOOD_INDEX_PREFIX ?? 'bitemate:meetups:food:',
    inviteExpiryHours: parseInt(process.env.MEETUP_INVITE_EXPIRY_HOURS ?? '24', 10),
    freeDailyInviteLimit: parseInt(process.env.MEETUP_FREE_DAILY_INVITE_LIMIT ?? '3', 10),
    premiumDailyInviteLimit: parseInt(process.env.MEETUP_PREMIUM_DAILY_INVITE_LIMIT ?? '9999', 10),
    timeMatchWindowHours: parseInt(process.env.MEETUP_TIME_MATCH_WINDOW_HOURS ?? '2', 10),
    ratingMatchTolerance: parseFloat(process.env.MEETUP_RATING_MATCH_TOLERANCE ?? '1.5'),
    maxMatchResults: parseInt(process.env.MEETUP_MAX_MATCH_RESULTS ?? '30', 10),
}));
exports.intentConfig = (0, config_1.registerAs)('intent', () => ({
    geoKey: process.env.INTENT_GEO_KEY ?? 'bitemate:intents:geo',
    metaPrefix: process.env.INTENT_META_PREFIX ?? 'bitemate:intents:meta:',
    foodIndexPrefix: process.env.INTENT_FOOD_INDEX_PREFIX ?? 'bitemate:intents:food:',
    matchCachePrefix: process.env.INTENT_MATCH_CACHE_PREFIX ?? 'bitemate:intents:matches:',
    dailyCreateLimit: parseInt(process.env.INTENT_DAILY_CREATE_LIMIT ?? '5', 10),
    maxConcurrentActive: parseInt(process.env.INTENT_MAX_CONCURRENT_ACTIVE ?? '3', 10),
    maxMatchResults: parseInt(process.env.INTENT_MAX_MATCH_RESULTS ?? '30', 10),
    matchCacheTtlSeconds: parseInt(process.env.INTENT_MATCH_CACHE_TTL_SECONDS ?? '120', 10),
    weightDistance: parseFloat(process.env.INTENT_WEIGHT_DISTANCE ?? '40'),
    weightFoodSimilarity: parseFloat(process.env.INTENT_WEIGHT_FOOD_SIMILARITY ?? '25'),
    weightTimeOverlap: parseFloat(process.env.INTENT_WEIGHT_TIME_OVERLAP ?? '15'),
    weightRatingSimilarity: parseFloat(process.env.INTENT_WEIGHT_RATING_SIMILARITY ?? '10'),
    weightReliability: parseFloat(process.env.INTENT_WEIGHT_RELIABILITY ?? '10'),
    cancelPenaltyThreshold: parseInt(process.env.INTENT_CANCEL_PENALTY_THRESHOLD ?? '3', 10),
    refreshNearbyLimit: parseInt(process.env.INTENT_REFRESH_NEARBY_LIMIT ?? '20', 10),
}));
exports.notificationConfig = (0, config_1.registerAs)('notification', () => ({
    queueKey: process.env.NOTIFICATION_QUEUE_KEY ?? 'bitemate:notifications:queue',
    retryQueueKey: process.env.NOTIFICATION_RETRY_QUEUE_KEY ?? 'bitemate:notifications:retry',
    dedupePrefix: process.env.NOTIFICATION_DEDUPE_PREFIX ?? 'bitemate:notifications:dedup:',
    dedupeTtlSeconds: parseInt(process.env.NOTIFICATION_DEDUPE_TTL_SECONDS ?? '86400', 10),
    maxRetries: parseInt(process.env.NOTIFICATION_MAX_RETRIES ?? '5', 10),
    retryDelayMs: parseInt(process.env.NOTIFICATION_RETRY_DELAY_MS ?? '3000', 10),
    batchSize: parseInt(process.env.NOTIFICATION_BATCH_SIZE ?? '50', 10),
    sendSecret: process.env.NOTIFICATION_SEND_SECRET ?? '',
    pageSize: parseInt(process.env.NOTIFICATION_PAGE_SIZE ?? '30', 10),
}));
exports.mongoConfig = (0, config_1.registerAs)('mongo', () => ({
    uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/bitemate',
}));
exports.chatConfig = (0, config_1.registerAs)('chat', () => ({
    presencePrefix: process.env.CHAT_PRESENCE_PREFIX ?? 'bitemate:presence:',
    typingTtlSeconds: parseInt(process.env.CHAT_TYPING_TTL_SECONDS ?? '5', 10),
    messagesPageSize: parseInt(process.env.CHAT_MESSAGES_PAGE_SIZE ?? '50', 10),
}));
exports.premiumConfig = (0, config_1.registerAs)('premium', () => ({
    monthlyPrice: parseFloat(process.env.PREMIUM_MONTHLY_PRICE ?? '9.99'),
    durationDays: parseInt(process.env.PREMIUM_DURATION_DAYS ?? '30', 10),
    visibilityBoost: parseFloat(process.env.PREMIUM_VISIBILITY_BOOST ?? '5'),
    priorityRankingBoost: parseFloat(process.env.PREMIUM_RANKING_BOOST ?? '10'),
    restaurantAdBoost: parseFloat(process.env.PREMIUM_RESTAURANT_AD_BOOST ?? '15'),
}));
exports.rankingConfig = (0, config_1.registerAs)('ranking', () => ({
    cacheTtlSeconds: parseInt(process.env.RANKING_CACHE_TTL_SECONDS ?? '120', 10),
    dailyActivityCap: parseInt(process.env.RANKING_DAILY_ACTIVITY_CAP ?? '20', 10),
}));
exports.monetizationConfig = (0, config_1.registerAs)('monetization', () => ({
    minAdBudget: parseFloat(process.env.MONETIZATION_MIN_AD_BUDGET ?? '25'),
    adCpm: parseFloat(process.env.MONETIZATION_AD_CPM ?? '2'),
    adClickCost: parseFloat(process.env.MONETIZATION_AD_CLICK_COST ?? '0.5'),
    affiliateAdShare: parseFloat(process.env.MONETIZATION_AFFILIATE_AD_SHARE ?? '0.2'),
    affiliateBookingRate: parseFloat(process.env.MONETIZATION_AFFILIATE_BOOKING_RATE ?? '0.05'),
}));
exports.adminConfig = (0, config_1.registerAs)('admin', () => ({
    bootstrapEmail: process.env.ADMIN_BOOTSTRAP_EMAIL || undefined,
}));
exports.walletConfig = (0, config_1.registerAs)('wallet', () => ({
    encryptionKey: process.env.WALLET_ENCRYPTION_KEY ?? 'dev-only-wallet-encryption-key-32chars!!',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || undefined,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || undefined,
    coinbaseApiKey: process.env.COINBASE_COMMERCE_API_KEY || undefined,
    cacheTtlSeconds: parseInt(process.env.WALLET_CACHE_TTL_SECONDS ?? '60', 10),
    depositFeePercent: parseFloat(process.env.WALLET_DEPOSIT_FEE_PERCENT ?? '2.5'),
    withdrawFeePercent: parseFloat(process.env.WALLET_WITHDRAW_FEE_PERCENT ?? '1'),
    withdrawFeeFlat: parseFloat(process.env.WALLET_WITHDRAW_FEE_FLAT ?? '1'),
    transferFeePercent: parseFloat(process.env.WALLET_TRANSFER_FEE_PERCENT ?? '0.5'),
    cryptoWithdrawFeeFlat: parseFloat(process.env.WALLET_CRYPTO_WITHDRAW_FEE_FLAT ?? '2'),
    escrowFeePercent: parseFloat(process.env.WALLET_ESCROW_FEE_PERCENT ?? '1.5'),
}));
//# sourceMappingURL=configuration.js.map