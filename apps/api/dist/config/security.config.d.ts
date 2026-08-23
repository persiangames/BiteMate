export declare const securityConfig: (() => {
    throttleTtlSeconds: number;
    throttleLimit: number;
    authThrottleTtlSeconds: number;
    authThrottleLimit: number;
    loginFailLimit: number;
    loginFailWindowSeconds: number;
    registerIpHourlyLimit: number;
    jsonBodyLimit: string;
    trustProxy: boolean;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    throttleTtlSeconds: number;
    throttleLimit: number;
    authThrottleTtlSeconds: number;
    authThrottleLimit: number;
    loginFailLimit: number;
    loginFailWindowSeconds: number;
    registerIpHourlyLimit: number;
    jsonBodyLimit: string;
    trustProxy: boolean;
}>;
export declare const sentryConfig: (() => {
    dsn: string | undefined;
    enabled: boolean;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    dsn: string | undefined;
    enabled: boolean;
}>;
