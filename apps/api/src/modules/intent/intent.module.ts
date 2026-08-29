import { Module } from '@nestjs/common';
import { LocationModule } from '../location/location.module';
import { GrowthModule } from '../growth/growth.module';
import { MeetupsModule } from '../meetups/meetups.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PostsModule } from '../posts/posts.module';
import { IntentCacheService } from './intent-cache.service';
import { IntentMatchingService } from './intent-matching.service';
import { IntentController } from './intent.controller';
import { IntentService } from './intent.service';

@Module({
  imports: [LocationModule, MeetupsModule, NotificationsModule, GrowthModule, PostsModule],
  controllers: [IntentController],
  providers: [IntentService, IntentCacheService, IntentMatchingService],
  exports: [IntentService, IntentCacheService, IntentMatchingService],
})
export class IntentModule {}
