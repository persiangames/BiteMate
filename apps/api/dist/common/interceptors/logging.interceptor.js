"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const request_context_1 = require("../logging/request-context");
let LoggingInterceptor = class LoggingInterceptor {
    logger = new common_1.Logger('HTTP');
    intercept(context, next) {
        if (context.getType() !== 'http') {
            return next.handle();
        }
        const request = context.switchToHttp().getRequest();
        const { method, url } = request;
        const startedAt = Date.now();
        const requestId = (0, request_context_1.getRequestId)();
        const store = request_context_1.requestContext.getStore();
        if (store && request.user?.sub) {
            store.userId = request.user.sub;
        }
        return next.handle().pipe((0, rxjs_1.tap)(() => {
            const response = context.switchToHttp().getResponse();
            this.write(method, url, response.statusCode, Date.now() - startedAt, requestId, request.user?.sub);
        }));
    }
    write(method, url, status, durationMs, requestId, userId) {
        const entry = JSON.stringify({
            msg: 'http_request',
            method,
            url,
            status,
            durationMs,
            requestId,
            userId: userId ?? null,
        });
        if (status >= 500) {
            this.logger.error(entry);
            return;
        }
        this.logger.log(entry);
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map