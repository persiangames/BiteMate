"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.envValidationSchema = void 0;
const Joi = __importStar(require("joi"));
const production = Joi.valid('production', 'staging');
exports.envValidationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test', 'staging')
        .default('development'),
    PORT: Joi.number().port().default(3000),
    API_PREFIX: Joi.string().default('api'),
    DATABASE_URL: Joi.string().uri().required(),
    REDIS_HOST: Joi.string().hostname().default('localhost'),
    REDIS_PORT: Joi.number().port().default(6379),
    REDIS_PASSWORD: Joi.when('NODE_ENV', {
        is: production,
        then: Joi.string().min(8).required(),
        otherwise: Joi.string().allow('').optional(),
    }),
    REDIS_DB: Joi.number().integer().min(0).default(0),
    CORS_ORIGINS: Joi.string().default('http://localhost:5173,http://localhost:3001'),
    LOG_LEVEL: Joi.string()
        .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace')
        .default('info'),
    TRUST_PROXY: Joi.string().valid('true', 'false').default('false'),
    THROTTLE_TTL_SECONDS: Joi.number().integer().min(1).default(60),
    THROTTLE_LIMIT: Joi.number().integer().min(1).default(120),
    AUTH_THROTTLE_TTL_SECONDS: Joi.number().integer().min(1).default(60),
    AUTH_THROTTLE_LIMIT: Joi.number().integer().min(1).default(8),
    LOGIN_FAIL_LIMIT: Joi.number().integer().min(1).default(8),
    LOGIN_FAIL_WINDOW_SECONDS: Joi.number().integer().min(30).default(900),
    REGISTER_IP_HOURLY_LIMIT: Joi.number().integer().min(1).default(3),
    JSON_BODY_LIMIT: Joi.string().default('1mb'),
    JWT_ISSUER: Joi.string().default('bitemate'),
    JWT_AUDIENCE: Joi.string().default('bitemate-app'),
    SENTRY_DSN: Joi.when('NODE_ENV', {
        is: production,
        then: Joi.string().uri().required(),
        otherwise: Joi.string().uri().allow('').optional(),
    }),
    JWT_SECRET: Joi.when('NODE_ENV', {
        is: production,
        then: Joi.string().min(32).invalid('dev-only-jwt-secret-change-me').required(),
        otherwise: Joi.string().min(16).default('dev-only-jwt-secret-change-me'),
    }),
    JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
    FIREBASE_PROJECT_ID: Joi.string().allow('').optional(),
    FIREBASE_CLIENT_EMAIL: Joi.string().allow('').optional(),
    FIREBASE_PRIVATE_KEY: Joi.string().allow('').optional(),
    OTP_EXPIRES_IN_SECONDS: Joi.number().integer().min(60).default(300),
    OTP_MAX_ATTEMPTS: Joi.number().integer().min(1).default(5),
    LIVE_LOCATION_TTL_SECONDS: Joi.number().integer().min(60).default(300),
    LIVE_LOCATION_UPDATE_INTERVAL_SECONDS: Joi.number().integer().min(5).default(30),
    REDIS_GEO_KEY: Joi.string().default('bitemate:geo:live'),
    STORAGE_PROVIDER: Joi.when('NODE_ENV', {
        is: production,
        then: Joi.string().valid('s3').required(),
        otherwise: Joi.string().valid('local', 's3').default('local'),
    }),
    AWS_REGION: Joi.when('NODE_ENV', {
        is: production,
        then: Joi.string().required(),
        otherwise: Joi.string().allow('').optional(),
    }),
    AWS_S3_BUCKET: Joi.when('NODE_ENV', {
        is: production,
        then: Joi.string().required(),
        otherwise: Joi.string().allow('').optional(),
    }),
    AWS_ACCESS_KEY_ID: Joi.string().allow('').optional(),
    AWS_SECRET_ACCESS_KEY: Joi.string().allow('').optional(),
    LOCAL_UPLOAD_DIR: Joi.string().default('uploads'),
    MEDIA_PUBLIC_BASE_URL: Joi.when('NODE_ENV', {
        is: production,
        then: Joi.string().uri().required(),
        otherwise: Joi.string().default('http://localhost:3000/uploads'),
    }),
    MONGODB_URI: Joi.string().uri().required(),
    WALLET_ENCRYPTION_KEY: Joi.when('NODE_ENV', {
        is: production,
        then: Joi.string().min(32).invalid('dev-only-wallet-encryption-key-32chars!!').required(),
        otherwise: Joi.string().min(32).default('dev-only-wallet-encryption-key-32chars!!'),
    }),
    STRIPE_SECRET_KEY: Joi.when('NODE_ENV', {
        is: production,
        then: Joi.string().required(),
        otherwise: Joi.string().allow('').optional(),
    }),
    STRIPE_WEBHOOK_SECRET: Joi.when('NODE_ENV', {
        is: production,
        then: Joi.string().required(),
        otherwise: Joi.string().allow('').optional(),
    }),
    COINBASE_COMMERCE_API_KEY: Joi.when('NODE_ENV', {
        is: production,
        then: Joi.string().required(),
        otherwise: Joi.string().allow('').optional(),
    }),
    WALLET_CACHE_TTL_SECONDS: Joi.number().integer().min(10).default(60),
    WALLET_DEPOSIT_FEE_PERCENT: Joi.number().min(0).default(2.5),
    WALLET_WITHDRAW_FEE_PERCENT: Joi.number().min(0).default(1),
    WALLET_WITHDRAW_FEE_FLAT: Joi.number().min(0).default(1),
    WALLET_TRANSFER_FEE_PERCENT: Joi.number().min(0).default(0.5),
    WALLET_CRYPTO_WITHDRAW_FEE_FLAT: Joi.number().min(0).default(2),
    WALLET_ESCROW_FEE_PERCENT: Joi.number().min(0).default(1.5),
    PREMIUM_MONTHLY_PRICE: Joi.number().min(0).default(9.99),
    PREMIUM_DURATION_DAYS: Joi.number().integer().min(1).default(30),
    PREMIUM_VISIBILITY_BOOST: Joi.number().min(0).default(5),
    PREMIUM_RANKING_BOOST: Joi.number().min(0).default(10),
    RANKING_CACHE_TTL_SECONDS: Joi.number().integer().min(10).default(120),
    RANKING_DAILY_ACTIVITY_CAP: Joi.number().integer().min(1).default(20),
    MONETIZATION_MIN_AD_BUDGET: Joi.number().min(1).default(25),
    MONETIZATION_AFFILIATE_BOOKING_RATE: Joi.number().min(0).max(1).default(0.05),
    ADMIN_BOOTSTRAP_EMAIL: Joi.string().email().allow('').optional(),
});
//# sourceMappingURL=env.validation.js.map