import { PrismaService } from '../database/prisma.service';
import { PresenceService } from '../chat/presence.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { FcmService } from './fcm.service';
export declare class NotificationDeliveryService {
    private readonly prisma;
    private readonly presenceService;
    private readonly realtimeGateway;
    private readonly fcmService;
    constructor(prisma: PrismaService, presenceService: PresenceService, realtimeGateway: RealtimeGateway, fcmService: FcmService);
    deliver(notificationId: string): Promise<boolean>;
    private markDelivered;
    private parseDisabledTypes;
    private toDto;
    private stringifyData;
}
