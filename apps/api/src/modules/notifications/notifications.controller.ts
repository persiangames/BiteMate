import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import type {
  NotificationDto,
  NotificationSettingsDto,
  NotificationsListResponseDto,
} from '@bitemate/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireOtpVerified } from '../../common/decorators/auth.decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OtpVerifiedGuard } from '../../common/guards/otp-verified.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import {
  MarkNotificationReadDto,
  NotificationListQueryDto,
  RegisterDeviceTokenDto,
  SendNotificationDto,
  UpdateNotificationSettingsDto,
} from './dto/notifications.dto';
import { NotificationsService } from './notifications.service';

@Controller()
@UseGuards(JwtAuthGuard, OtpVerifiedGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('notifications/send')
  @RequireOtpVerified()
  sendNotification(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SendNotificationDto,
    @Headers('x-notification-secret') sendSecret?: string,
  ): Promise<NotificationDto | null> {
    return this.notificationsService.send(user.sub, dto, sendSecret);
  }

  @Get('notifications')
  @RequireOtpVerified()
  listNotifications(
    @CurrentUser() user: JwtPayload,
    @Query() query: NotificationListQueryDto,
  ): Promise<NotificationsListResponseDto> {
    return this.notificationsService.listNotifications(user.sub, query.cursor);
  }

  @Put('notifications/settings')
  @RequireOtpVerified()
  updateSettings(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateNotificationSettingsDto,
  ): Promise<NotificationSettingsDto> {
    return this.notificationsService.updateSettings(user.sub, dto);
  }

  @Get('notifications/settings')
  @RequireOtpVerified()
  getSettings(@CurrentUser() user: JwtPayload): Promise<NotificationSettingsDto> {
    return this.notificationsService.getSettings(user.sub);
  }

  @Post('notifications/read')
  @RequireOtpVerified()
  markRead(
    @CurrentUser() user: JwtPayload,
    @Body() dto: MarkNotificationReadDto,
  ): Promise<NotificationDto> {
    return this.notificationsService.markRead(user.sub, dto.notificationId);
  }

  @Post('notifications/read-all')
  @RequireOtpVerified()
  markAllRead(@CurrentUser() user: JwtPayload): Promise<{ updated: number }> {
    return this.notificationsService.markAllRead(user.sub);
  }

  @Post('notifications/devices')
  @RequireOtpVerified()
  registerDevice(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RegisterDeviceTokenDto,
  ): Promise<{ registered: true }> {
    return this.notificationsService
      .registerDeviceToken(user.sub, dto.token, dto.platform ?? 'web')
      .then(() => ({ registered: true }));
  }
}
