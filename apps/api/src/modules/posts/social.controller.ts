import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import type { FollowListResponseDto, FollowResponseDto } from '@bitemate/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireOtpVerified } from '../../common/decorators/auth.decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OtpVerifiedGuard } from '../../common/guards/otp-verified.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { FollowListQueryDto } from './dto/posts.dto';
import { SocialService } from './posts.service';

@Controller()
@UseGuards(JwtAuthGuard, OtpVerifiedGuard, RolesGuard)
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Post('follow/:id')
  @RequireOtpVerified()
  toggleFollow(
    @CurrentUser() user: JwtPayload,
    @Param('id') targetUserId: string,
  ): Promise<FollowResponseDto> {
    return this.socialService.toggleFollow(user.sub, targetUserId);
  }

  @Get('users/:id/followers')
  @RequireOtpVerified()
  getFollowers(
    @CurrentUser() user: JwtPayload,
    @Param('id') targetUserId: string,
    @Query() query: FollowListQueryDto,
  ): Promise<FollowListResponseDto> {
    return this.socialService.getFollowers(
      targetUserId,
      user.sub,
      query.cursor,
      query.limit,
    );
  }

  @Get('users/:id/following')
  @RequireOtpVerified()
  getFollowing(
    @CurrentUser() user: JwtPayload,
    @Param('id') targetUserId: string,
    @Query() query: FollowListQueryDto,
  ): Promise<FollowListResponseDto> {
    return this.socialService.getFollowing(
      targetUserId,
      user.sub,
      query.cursor,
      query.limit,
    );
  }
}
