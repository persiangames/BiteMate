import { Module } from '@nestjs/common';
import { LocationModule } from '../location/location.module';
import { MessagingModule } from '../messaging/messaging.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [LocationModule, MessagingModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
