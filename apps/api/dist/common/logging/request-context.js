"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestContext = void 0;
exports.getRequestId = getRequestId;
exports.getRequestUserId = getRequestUserId;
const node_async_hooks_1 = require("node:async_hooks");
exports.requestContext = new node_async_hooks_1.AsyncLocalStorage();
function getRequestId() {
    return exports.requestContext.getStore()?.requestId;
}
function getRequestUserId() {
    return exports.requestContext.getStore()?.userId;
}
//# sourceMappingURL=request-context.js.map