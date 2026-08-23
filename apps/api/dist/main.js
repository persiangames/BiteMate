"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("./instrument");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const helmet_1 = __importDefault(require("helmet"));
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const environment_util_1 = require("./common/utils/environment.util");
function resolveLogLevels(level) {
    const normalized = level === 'info' ? 'log' : level === 'trace' ? 'verbose' : level;
    const ordered = ['fatal', 'error', 'warn', 'log', 'debug', 'verbose'];
    const index = ordered.indexOf(normalized);
    if (index === -1) {
        return ['error', 'warn', 'log'];
    }
    return ordered.slice(0, index + 1);
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(), {
        bufferLogs: false,
        rawBody: true,
    });
    const configService = app.get(config_1.ConfigService);
    const nodeEnv = configService.get('app.nodeEnv', 'development');
    const apiPrefix = configService.get('app.apiPrefix', 'api');
    const port = configService.get('app.port', 3000);
    const corsOrigins = configService.get('app.corsOrigins', []);
    const logLevel = configService.get('logging.level', 'info');
    const uploadDir = configService.get('storage.localUploadDir', 'uploads');
    const trustProxy = configService.get('security.trustProxy', false);
    const jsonBodyLimit = configService.get('security.jsonBodyLimit', '1mb');
    if (trustProxy) {
        app.set('trust proxy', 1);
    }
    app.disable('x-powered-by');
    app.useBodyParser('json', { limit: jsonBodyLimit });
    app.useBodyParser('urlencoded', { limit: jsonBodyLimit, extended: true });
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: (0, environment_util_1.isProductionEnv)(nodeEnv) ? undefined : false,
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    if (!(0, node_fs_1.existsSync)(uploadDir)) {
        (0, node_fs_1.mkdirSync)(uploadDir, { recursive: true });
    }
    app.useStaticAssets((0, node_path_1.join)(process.cwd(), uploadDir), {
        prefix: '/uploads/',
        setHeaders: (res) => {
            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        },
    });
    app.useLogger(resolveLogLevels(logLevel));
    app.setGlobalPrefix(apiPrefix);
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor());
    await app.listen(port);
    const logger = new common_1.Logger('Bootstrap');
    logger.log(`BiteMate API [${nodeEnv}] on http://0.0.0.0:${port}/${apiPrefix}`);
}
bootstrap();
//# sourceMappingURL=main.js.map