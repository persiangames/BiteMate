import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type {
  MeetupDto,
  MeetupInviteDto,
  MeetupInviteLimitDto,
  MeetupInvitesResponseDto,
  MeetupMatchesResponseDto,
  MeetupRoomDto,
  MeetupRoomMessageDto,
  MeetupRoomMessagesResponseDto,
  NearbyMeetupsResponseDto,
} from '@bitemate/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireOtpVerified } from '../../common/decorators/auth.decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OtpVerifiedGuard } from '../../common/guards/otp-verified.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import {
  CreateMeetupDto,
  MeetupMatchQueryDto,
  NearbyMeetupsQueryDto,
  RespondMeetupInviteDto,
  RequestMeetupJoinDto,
  SendMeetupInviteDto,
  SendRoomMessageDto,
  UpdateMeetupDto,
} from './dto/meetups.dto';
import { MeetupsService } from './meetups.service';

@Controller()
@UseGuards(JwtAuthGuard, OtpVerifiedGuard, RolesGuard)
export class MeetupsController {
  constructor(private readonly meetupsService: MeetupsService) {}

  @Post('meetups')
  @RequireOtpVerified()
  createMeetup(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateMeetupDto,
  ): Promise<MeetupDto> {
    return this.meetupsService.createMeetup(user.sub, dto);
  }

  @Get('meetups/me')
  @RequireOtpVerified()
  listMyMeetups(@CurrentUser() user: JwtPayload): Promise<MeetupDto[]> {
    return this.meetupsService.listMyMeetups(user.sub);
  }

  @Get('meetups/nearby')
  @RequireOtpVerified()
  findNearbyMeetups(
    @CurrentUser() user: JwtPayload,
    @Query() query: NearbyMeetupsQueryDto,
  ): Promise<NearbyMeetupsResponseDto> {
    return this.meetupsService.findNearbyMeetups(user.sub, query);
  }

  @Get('meetups/match')
  @RequireOtpVerified()
  getMatches(
    @CurrentUser() user: JwtPayload,
    @Query() query: MeetupMatchQueryDto,
  ): Promise<MeetupMatchesResponseDto> {
    return this.meetupsService.getMatches(user.sub, query.meetupId);
  }

  @Get('meetups/invites/me')
  @RequireOtpVerified()
  listMyInvites(
    @CurrentUser() user: JwtPayload,
  ): Promise<MeetupInvitesResponseDto> {
    return this.meetupsService.listMyInvites(user.sub);
  }

  @Get('meetups/invites/limit')
  @RequireOtpVerified()
  getInviteLimit(
    @CurrentUser() user: JwtPayload,
  ): Promise<MeetupInviteLimitDto> {
    return this.meetupsService.getInviteLimit(user.sub);
  }

  @Post('meetups/invite')
  @RequireOtpVerified()
  sendInvite(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SendMeetupInviteDto,
  ): Promise<MeetupInviteDto> {
    return this.meetupsService.sendInvite(user.sub, dto.meetupId, dto.inviteeId);
  }

  @Post('meetups/request-join')
  @RequireOtpVerified()
  requestJoin(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RequestMeetupJoinDto,
  ): Promise<MeetupInviteDto> {
    return this.meetupsService.requestJoin(user.sub, dto.meetupId);
  }

  @Post('meetups/accept')
  @RequireOtpVerified()
  acceptInvite(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RespondMeetupInviteDto,
  ): Promise<MeetupInviteDto> {
    return this.meetupsService.acceptInvite(user.sub, dto.inviteId);
  }

  @Post('meetups/reject')
  @RequireOtpVerified()
  rejectInvite(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RespondMeetupInviteDto,
  ): Promise<MeetupInviteDto> {
    return this.meetupsService.rejectInvite(user.sub, dto.inviteId);
  }

  @Get('meetups/rooms/:roomId')
  @RequireOtpVerified()
  getRoom(
    @CurrentUser() user: JwtPayload,
    @Param('roomId') roomId: string,
  ): Promise<MeetupRoomDto> {
    return this.meetupsService.getRoom(user.sub, roomId);
  }

  @Get('meetups/rooms/:roomId/messages')
  @RequireOtpVerified()
  getRoomMessages(
    @CurrentUser() user: JwtPayload,
    @Param('roomId') roomId: string,
  ): Promise<MeetupRoomMessagesResponseDto> {
    return this.meetupsService.getRoomMessages(user.sub, roomId);
  }

  @Post('meetups/rooms/:roomId/messages')
  @RequireOtpVerified()
  sendRoomMessage(
    @CurrentUser() user: JwtPayload,
    @Param('roomId') roomId: string,
    @Body() dto: SendRoomMessageDto,
  ): Promise<MeetupRoomMessageDto> {
    return this.meetupsService.sendRoomMessage(user.sub, roomId, dto);
  }

  @Get('meetups/:meetupId')
  @RequireOtpVerified()
  getMeetup(
    @CurrentUser() user: JwtPayload,
    @Param('meetupId') meetupId: string,
  ): Promise<MeetupDto> {
    return this.meetupsService.getMeetupById(user.sub, meetupId);
  }

  @Patch('meetups/:meetupId')
  @RequireOtpVerified()
  updateMeetup(
    @CurrentUser() user: JwtPayload,
    @Param('meetupId') meetupId: string,
    @Body() dto: UpdateMeetupDto,
  ): Promise<MeetupDto> {
    return this.meetupsService.updateMeetup(user.sub, meetupId, dto);
  }

  @Post('meetups/:meetupId/cancel')
  @RequireOtpVerified()
  cancelMeetup(
    @CurrentUser() user: JwtPayload,
    @Param('meetupId') meetupId: string,
  ): Promise<MeetupDto> {
    return this.meetupsService.cancelMeetupByCreator(user.sub, meetupId);
  }
}
