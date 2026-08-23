"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const chat_module_1 = require("../chat/chat.module");
const realtime_module_1 = require("../realtime/realtime.module");
const fcm_service_1 = require("./fcm.service");
const notification_delivery_service_1 = require("./notification-delivery.service");
const notification_queue_service_1 = require("./notification-queue.service");
const notifications_controller_1 = require("./notifications.controller");
const notifications_service_1 = require("./notifications.service");
const skipMongo = process.env.SKIP_MONGO === 'true';
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            realtime_module_1.RealtimeModule,
            ...(skipMongo ? [] : [(0, common_1.forwardRef)(() => chat_module_1.ChatModule)]),
        ],
        controllers: [notifications_controller_1.NotificationsController],
        providers: [
            notifications_service_1.NotificationsService,
            notification_queue_service_1.NotificationQueueService,
            notification_delivery_service_1.NotificationDeliveryService,
            fcm_service_1.FcmService,
        ],
        exports: [notifications_service_1.NotificationsService],
    })
], NotificationsModule);
//# sourceMappingURL=notifications.module.js.map