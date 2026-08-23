"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationDeliveryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const presence_service_1 = require("../chat/presence.service");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
const fcm_service_1 = require("./fcm.service");
let NotificationDeliveryService = class NotificationDeliveryService {
    prisma;
    presenceService;
    realtimeGateway;
    fcmService;
    constructor(prisma, presenceService, realtimeGateway, fcmService) {
        this.prisma = prisma;
        this.presenceService = presenceService;
        this.realtimeGateway = realtimeGateway;
        this.fcmService = fcmService;
    }
    async deliver(notificationId) {
        const notification = await this.prisma.notification.findUnique({
            where: { id: notificationId },
        });
        if (!notification) {
            return true;
        }
        if (notification.deliveredAt) {
            return true;
        }
        const settings = await this.prisma.notificationSettings.upsert({
            where: { userId: notification.userId },
            create: { userId: notification.userId },
            update: {},
        });
        if (settings.muted) {
            await this.markDelivered(notification.id);
            return true;
        }
        const disabledTypes = this.parseDisabledTypes(settings.disabledTypes);
        if (disabledTypes.includes(notification.type)) {
            await this.markDelivered(notification.id);
            return true;
        }
        const dto = this.toDto(notification);
        const presence = await this.presenceService.getPresence(notification.userId);
        let delivered = false;
        if (presence.isOnline) {
            this.realtimeGateway.emitNotification(notification.userId, dto);
            delivered = true;
        }
        const tokens = await this.prisma.deviceToken.findMany({
            where: { userId: notification.userId },
            select: { token: true },
        });
        if (!presence.isOnline && tokens.length && this.fcmService.isConfigured()) {
            const result = await this.fcmService.sendToTokens({
                tokens: tokens.map((entry) => entry.token),
                title: notification.title,
                body: notification.body,
                data: this.stringifyData(notification),
            });
            delivered = delivered || result.successCount > 0;
        }
        else if (presence.isOnline) {
            delivered = true;
        }
        if (delivered) {
            await this.markDelivered(notification.id);
            return true;
        }
        return false;
    }
    async markDelivered(notificationId) {
        await this.prisma.notification.update({
            where: { id: notificationId },
            data: { deliveredAt: new Date() },
        });
    }
    parseDisabledTypes(value) {
        if (!Array.isArray(value)) {
            return [];
        }
        return value.filter((item) => typeof item === 'string');
    }
    toDto(notification) {
        return {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            body: notification.body,
            data: notification.data ?? null,
            entityId: notification.entityId,
            readAt: notification.readAt?.toISOString() ?? null,
            deliveredAt: notification.deliveredAt?.toISOString() ?? null,
            createdAt: notification.createdAt.toISOString(),
        };
    }
    stringifyData(notification) {
        const payload = {
            notificationId: notification.id,
            type: notification.type,
            entityId: notification.entityId ?? '',
        };
        if (notification.data && typeof notification.data === 'object') {
            for (const [key, value] of Object.entries(notification.data)) {
                payload[key] = typeof value === 'string' ? value : JSON.stringify(value);
            }
        }
        return payload;
    }
};
exports.NotificationDeliveryService = NotificationDeliveryService;
exports.NotificationDeliveryService = NotificationDeliveryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        presence_service_1.PresenceService,
        realtime_gateway_1.RealtimeGateway,
        fcm_service_1.FcmService])
], NotificationDeliveryService);
//# sourceMappingURL=notification-delivery.service.js.map