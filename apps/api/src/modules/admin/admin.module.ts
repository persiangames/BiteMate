import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [NotificationsModule],
  controllers: [AdminController, ReportsController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
