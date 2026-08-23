declare const _default: (() => {
    nodeEnv: string;
    port: number;
    apiPrefix: string;
    corsOrigins: string[];
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    nodeEnv: string;
    port: number;
    apiPrefix: string;
    corsOrigins: string[];
}>;
export default _default;
export declare const databaseConfig: (() => {
    url: string | undefined;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    url: string | undefined;
}>;
export declare const redisConfig: (() => {
    host: string;
    port: number;
    password: string | undefined;
    db: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    host: string;
    port: number;
    password: string | undefined;
    db: number;
}>;
export declare const loggingConfig: (() => {
    level: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    level: string;
}>;
export declare const jwtConfig: (() => {
    secret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
    issuer: string;
    audience: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    secret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
    issuer: string;
    audience: string;
}>;
export declare const firebaseConfig: (() => {
    projectId: string | undefined;
    clientEmail: string | undefined;
    privateKey: string | undefined;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    projectId: string | undefined;
    clientEmail: string | undefined;
    privateKey: string | undefined;
}>;
export declare const otpConfig: (() => {
    expiresInSeconds: number;
    maxAttempts: number;
    skipInDev: boolean;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    expiresInSeconds: number;
    maxAttempts: number;
    skipInDev: boolean;
}>;
export declare const locationConfig: (() => {
    liveLocationTtlSeconds: number;
    liveLocationUpdateIntervalSeconds: number;
    geoKey: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    liveLocationTtlSeconds: number;
    liveLocationUpdateIntervalSeconds: number;
    geoKey: string;
}>;
export declare const storageConfig: (() => {
    provider: string;
    awsRegion: string | undefined;
    awsS3Bucket: string | undefined;
    awsAccessKeyId: string | undefined;
    awsSecretAccessKey: string | undefined;
    localUploadDir: string;
    publicBaseUrl: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    provider: string;
    awsRegion: string | undefined;
    awsS3Bucket: string | undefined;
    awsAccessKeyId: string | undefined;
    awsSecretAccessKey: string | undefined;
    localUploadDir: string;
    publicBaseUrl: string;
}>;
export declare const meetupConfig: (() => {
    geoKey: string;
    metaPrefix: string;
    foodIndexPrefix: string;
    inviteExpiryHours: number;
    freeDailyInviteLimit: number;
    premiumDailyInviteLimit: number;
    timeMatchWindowHours: number;
    ratingMatchTolerance: number;
    maxMatchResults: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    geoKey: string;
    metaPrefix: string;
    foodIndexPrefix: string;
    inviteExpiryHours: number;
    freeDailyInviteLimit: number;
    premiumDailyInviteLimit: number;
    timeMatchWindowHours: number;
    ratingMatchTolerance: number;
    maxMatchResults: number;
}>;
export declare const intentConfig: (() => {
    geoKey: string;
    metaPrefix: string;
    foodIndexPrefix: string;
    matchCachePrefix: string;
    dailyCreateLimit: number;
    maxConcurrentActive: number;
    maxMatchResults: number;
    matchCacheTtlSeconds: number;
    weightDistance: number;
    weightFoodSimilarity: number;
    weightTimeOverlap: number;
    weightRatingSimilarity: number;
    weightReliability: number;
    cancelPenaltyThreshold: number;
    refreshNearbyLimit: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    geoKey: string;
    metaPrefix: string;
    foodIndexPrefix: string;
    matchCachePrefix: string;
    dailyCreateLimit: number;
    maxConcurrentActive: number;
    maxMatchResults: number;
    matchCacheTtlSeconds: number;
    weightDistance: number;
    weightFoodSimilarity: number;
    weightTimeOverlap: number;
    weightRatingSimilarity: number;
    weightReliability: number;
    cancelPenaltyThreshold: number;
    refreshNearbyLimit: number;
}>;
export declare const notificationConfig: (() => {
    queueKey: string;
    retryQueueKey: string;
    dedupePrefix: string;
    dedupeTtlSeconds: number;
    maxRetries: number;
    retryDelayMs: number;
    batchSize: number;
    sendSecret: string;
    pageSize: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    queueKey: string;
    retryQueueKey: string;
    dedupePrefix: string;
    dedupeTtlSeconds: number;
    maxRetries: number;
    retryDelayMs: number;
    batchSize: number;
    sendSecret: string;
    pageSize: number;
}>;
export declare const mongoConfig: (() => {
    uri: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    uri: string;
}>;
export declare const chatConfig: (() => {
    presencePrefix: string;
    typingTtlSeconds: number;
    messagesPageSize: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    presencePrefix: string;
    typingTtlSeconds: number;
    messagesPageSize: number;
}>;
export declare const premiumConfig: (() => {
    monthlyPrice: number;
    durationDays: number;
    visibilityBoost: number;
    priorityRankingBoost: number;
    restaurantAdBoost: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    monthlyPrice: number;
    durationDays: number;
    visibilityBoost: number;
    priorityRankingBoost: number;
    restaurantAdBoost: number;
}>;
export declare const rankingConfig: (() => {
    cacheTtlSeconds: number;
    dailyActivityCap: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    cacheTtlSeconds: number;
    dailyActivityCap: number;
}>;
export declare const monetizationConfig: (() => {
    minAdBudget: number;
    adCpm: number;
    adClickCost: number;
    affiliateAdShare: number;
    affiliateBookingRate: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    minAdBudget: number;
    adCpm: number;
    adClickCost: number;
    affiliateAdShare: number;
    affiliateBookingRate: number;
}>;
export declare const adminConfig: (() => {
    bootstrapEmail: string | undefined;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    bootstrapEmail: string | undefined;
}>;
export declare const walletConfig: (() => {
    encryptionKey: string;
    stripeSecretKey: string | undefined;
    stripeWebhookSecret: string | undefined;
    coinbaseApiKey: string | undefined;
    cacheTtlSeconds: number;
    depositFeePercent: number;
    withdrawFeePercent: number;
    withdrawFeeFlat: number;
    transferFeePercent: number;
    cryptoWithdrawFeeFlat: number;
    escrowFeePercent: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    encryptionKey: string;
    stripeSecretKey: string | undefined;
    stripeWebhookSecret: string | undefined;
    coinbaseApiKey: string | undefined;
    cacheTtlSeconds: number;
    depositFeePercent: number;
    withdrawFeePercent: number;
    withdrawFeeFlat: number;
    transferFeePercent: number;
    cryptoWithdrawFeeFlat: number;
    escrowFeePercent: number;
}>;
