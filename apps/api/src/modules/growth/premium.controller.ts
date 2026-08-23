import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import type {
  PremiumStatusDto,
  PremiumSubscribeResponseDto,
} from '@bitemate/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireOtpVerified } from '../../common/decorators/auth.decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OtpVerifiedGuard } from '../../common/guards/otp-verified.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { PremiumSubscribeDto } from './dto/growth.dto';
import { PremiumService } from './premium.service';
import { RankingService } from './ranking.service';

@Controller('premium')
@UseGuards(JwtAuthGuard, OtpVerifiedGuard, RolesGuard)
export class PremiumController {
  constructor(
    private readonly premiumService: PremiumService,
    private readonly rankingService: RankingService,
  ) {}

  @Get('status')
  @RequireOtpVerified()
  getStatus(@CurrentUser() user: JwtPayload): Promise<PremiumStatusDto> {
    return this.premiumService.getStatus(user.sub);
  }

  @Post('subscribe')
  @RequireOtpVerified()
  async subscribe(
    @CurrentUser() user: JwtPayload,
    @Body() dto: PremiumSubscribeDto,
  ): Promise<PremiumSubscribeResponseDto> {
    const result = await this.premiumService.subscribe(user.sub, dto);
    await this.rankingService.refreshUserRank(user.sub);
    return result;
  }
}
