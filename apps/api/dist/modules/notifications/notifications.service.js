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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../database/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const notification_queue_service_1 = require("./notification-queue.service");
let NotificationsService = class NotificationsService {
    prisma;
    redisService;
    queueService;
    configService;
    constructor(prisma, redisService, queueService, configService) {
        this.prisma = prisma;
        this.redisService = redisService;
        this.queueService = queueService;
        this.configService = configService;
    }
    async notify(payload) {
        const dedupeKey = payload.dedupeKey ??
            `${payload.userId}:${payload.type}:${payload.entityId ?? payload.title}`;
        const acquired = await this.acquireDedupe(dedupeKey);
        if (!acquired) {
            const existing = await this.prisma.notification.findUnique({
                where: { dedupeKey },
            });
            return existing ? this.toDto(existing) : null;
        }
        const notification = await this.prisma.notification.create({
            data: {
                userId: payload.userId,
                type: payload.type,
                title: payload.title,
                body: payload.body,
                data: payload.data,
                entityId: payload.entityId,
                dedupeKey,
            },
        });
        await this.queueService.enqueue({ notificationId: notification.id, attempt: 0 });
        return this.toDto(notification);
    }
    async send(senderUserId, payload, sendSecret) {
        const configuredSecret = this.configService.get('notification.sendSecret', '');
        const isSystemSend = Boolean(configuredSecret && sendSecret === configuredSecret);
        if (!isSystemSend && payload.recipientUserId !== senderUserId) {
            throw new common_1.ForbiddenException('Not allowed to send notifications to other users');
        }
        return this.notify({
            userId: payload.recipientUserId,
            type: payload.type,
            title: payload.title,
            body: payload.body,
            data: payload.data,
            entityId: payload.entityId,
            dedupeKey: payload.dedupeKey,
        });
    }
    async listNotifications(userId, cursor) {
        const pageSize = this.configService.get('notification.pageSize', 30);
        const items = await this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: pageSize + 1,
            ...(cursor
                ? {
                    cursor: { id: cursor },
                    skip: 1,
                }
                : {}),
        });
        const hasMore = items.length > pageSize;
        const page = hasMore ? items.slice(0, pageSize) : items;
        const unreadCount = await this.prisma.notification.count({
            where: { userId, readAt: null },
        });
        return {
            items: page.map((item) => this.toDto(item)),
            unreadCount,
            nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null,
            hasMore,
        };
    }
    async markRead(userId, notificationId) {
        const notification = await this.prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        const updated = await this.prisma.notification.update({
            where: { id: notificationId },
            data: { readAt: notification.readAt ?? new Date() },
        });
        return this.toDto(updated);
    }
    async markAllRead(userId) {
        const result = await this.prisma.notification.updateMany({
            where: { userId, readAt: null },
            data: { readAt: new Date() },
        });
        return { updated: result.count };
    }
    async getSettings(userId) {
        const settings = await this.getSettingsRecord(userId);
        return {
            muted: settings.muted,
            disabledTypes: this.parseDisabledTypes(settings.disabledTypes),
        };
    }
    async updateSettings(userId, payload) {
        await this.getSettingsRecord(userId);
        const updated = await this.prisma.notificationSettings.update({
            where: { userId },
            data: {
                ...(payload.muted !== undefined ? { muted: payload.muted } : {}),
                ...(payload.disabledTypes !== undefined
                    ? { disabledTypes: payload.disabledTypes }
                    : {}),
            },
        });
        return {
            muted: updated.muted,
            disabledTypes: this.parseDisabledTypes(updated.disabledTypes),
        };
    }
    async registerDeviceToken(userId, token, platform = 'web') {
        await this.prisma.deviceToken.upsert({
            where: { token },
            create: { userId, token, platform },
            update: { userId, platform, updatedAt: new Date() },
        });
    }
    async getSettingsRecord(userId) {
        return this.prisma.notificationSettings.upsert({
            where: { userId },
            create: { userId },
            update: {},
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
    async acquireDedupe(dedupeKey) {
        const prefix = this.configService.get('notification.dedupePrefix', 'bitemate:notifications:dedup:');
        const ttl = this.configService.get('notification.dedupeTtlSeconds', 86400);
        const client = this.redisService.getClient();
        const result = await client.set(`${prefix}${dedupeKey}`, '1', 'EX', ttl, 'NX');
        return result === 'OK';
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        notification_queue_service_1.NotificationQueueService,
        config_1.ConfigService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map