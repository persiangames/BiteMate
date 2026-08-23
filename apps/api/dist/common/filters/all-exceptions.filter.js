"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const request_context_1 = require("../logging/request-context");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    logger = new common_1.Logger(AllExceptionsFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const exceptionResponse = exception instanceof common_1.HttpException ? exception.getResponse() : null;
        const message = this.extractMessage(exceptionResponse, exception);
        if (status >= common_1.HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(JSON.stringify({
                msg: 'unhandled_exception',
                method: request.method,
                url: request.url,
                requestId: (0, request_context_1.getRequestId)(),
                status,
            }), exception instanceof Error ? exception.stack : String(exception));
        }
        else if (status >= common_1.HttpStatus.BAD_REQUEST) {
            this.logger.warn(JSON.stringify({
                msg: 'http_error',
                method: request.method,
                url: request.url,
                requestId: (0, request_context_1.getRequestId)(),
                status,
                message,
            }));
        }
        const body = {
            statusCode: status,
            message,
            error: exception instanceof common_1.HttpException
                ? exceptionResponse?.error ??
                    common_1.HttpStatus[status]
                : 'Internal Server Error',
            timestamp: new Date().toISOString(),
            path: request.url,
            requestId: (0, request_context_1.getRequestId)(),
        };
        response.status(status).json(body);
    }
    extractMessage(exceptionResponse, exception) {
        if (typeof exceptionResponse === 'string') {
            return exceptionResponse;
        }
        if (exceptionResponse &&
            typeof exceptionResponse === 'object' &&
            'message' in exceptionResponse) {
            return exceptionResponse.message;
        }
        if (exception instanceof Error) {
            return exception.message;
        }
        return 'Internal server error';
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map