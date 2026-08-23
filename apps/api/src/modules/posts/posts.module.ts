import { Module } from '@nestjs/common';
import { GrowthModule } from '../growth/growth.module';
import { LocationModule } from '../location/location.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PostsController } from './posts.controller';
import { SocialController } from './social.controller';
import { FeedService, PostsService, SocialService } from './posts.service';
import { PaginationHelper } from './pagination.helper';

@Module({
  imports: [LocationModule, GrowthModule, NotificationsModule],  controllers: [PostsController, SocialController],
  providers: [PostsService, FeedService, SocialService, PaginationHelper],
  exports: [PostsService, FeedService, SocialService],
})
export class PostsModule {}
