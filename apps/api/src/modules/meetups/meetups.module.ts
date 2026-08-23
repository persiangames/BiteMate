import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ChatModule } from '../chat/chat.module';
import { LocationModule } from '../location/location.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { GrowthModule } from '../growth/growth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MeetupCacheService } from './meetup-cache.service';
import { MeetupMatchingService } from './meetup-matching.service';
import { MeetupsController } from './meetups.controller';
import { MeetupsService } from './meetups.service';

const skipMongo = process.env.SKIP_MONGO === 'true';

@Module({
  imports: [
    AuthModule,
    LocationModule,
    RealtimeModule,
    GrowthModule,
    NotificationsModule,
    ...(skipMongo ? [] : [forwardRef(() => ChatModule)]),
  ],
  controllers: [MeetupsController],
  providers: [MeetupsService, MeetupCacheService, MeetupMatchingService],
  exports: [MeetupCacheService, MeetupMatchingService],
})
export class MeetupsModule {}
