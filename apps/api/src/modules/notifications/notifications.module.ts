import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ChatModule } from '../chat/chat.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { FcmService } from './fcm.service';
import { NotificationDeliveryService } from './notification-delivery.service';
import { NotificationQueueService } from './notification-queue.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

const skipMongo = process.env.SKIP_MONGO === 'true';

@Module({
  imports: [
    AuthModule,
    RealtimeModule,
    ...(skipMongo ? [] : [forwardRef(() => ChatModule)]),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationQueueService,
    NotificationDeliveryService,
    FcmService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
