import { Module } from '@nestjs/common';
import { LocationModule } from '../location/location.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [LocationModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
