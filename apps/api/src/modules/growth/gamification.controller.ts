import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import type { MeetupReviewDto, UserBadgesResponseDto, UserLevelDto } from '@bitemate/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireOtpVerified } from '../../common/decorators/auth.decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OtpVerifiedGuard } from '../../common/guards/otp-verified.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CreateMeetupReviewDto } from './dto/growth.dto';
import { GamificationService } from './gamification.service';

@Controller()
@UseGuards(JwtAuthGuard, OtpVerifiedGuard, RolesGuard)
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('user/level')
  @RequireOtpVerified()
  getUserLevel(@CurrentUser() user: JwtPayload): Promise<UserLevelDto> {
    return this.gamificationService.getUserLevel(user.sub);
  }

  @Get('user/badges')
  @RequireOtpVerified()
  getUserBadges(@CurrentUser() user: JwtPayload): Promise<UserBadgesResponseDto> {
    return this.gamificationService.getUserBadges(user.sub);
  }

  @Post('meetups/review')
  @RequireOtpVerified()
  submitMeetupReview(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateMeetupReviewDto,
  ): Promise<MeetupReviewDto> {
    return this.gamificationService.submitMeetupReview(
      user.sub,
      dto.meetupId,
      dto.reviewedUserId,
      dto.rating,
      dto.comment,
    );
  }
}
