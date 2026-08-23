import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import type { AuthUserDto, NearbyUsersResponseDto } from '@bitemate/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireOtpVerified } from '../../common/decorators/auth.decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OtpVerifiedGuard } from '../../common/guards/otp-verified.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { NearbyUsersQueryDto, UpdateLiveLocationDto } from './dto/location.dto';
import { LocationService } from './location.service';

@Controller('location')
@UseGuards(JwtAuthGuard, OtpVerifiedGuard, RolesGuard)
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post('live')
  @RequireOtpVerified()
  updateLiveLocation(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateLiveLocationDto,
  ): Promise<AuthUserDto> {
    return this.locationService.updateLiveLocation(user.sub, dto);
  }
}

@Controller('users')
@UseGuards(JwtAuthGuard, OtpVerifiedGuard, RolesGuard)
export class NearbyUsersController {
  constructor(private readonly locationService: LocationService) {}

  @Get('nearby')
  @RequireOtpVerified()
  findNearby(
    @CurrentUser() user: JwtPayload,
    @Query() query: NearbyUsersQueryDto,
  ): Promise<NearbyUsersResponseDto> {
    return this.locationService.findNearbyUsers(user.sub, query);
  }
}
