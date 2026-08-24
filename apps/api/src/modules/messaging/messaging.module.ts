import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MessagingService } from './messaging.service';
import { SmsService } from './sms.service';

@Module({
  providers: [EmailService, SmsService, MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}
