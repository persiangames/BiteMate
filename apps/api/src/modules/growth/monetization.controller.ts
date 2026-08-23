import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import type {
  AffiliateCommissionsResponseDto,
  RestaurantAdDto,
} from '@bitemate/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/auth.decorators';
import { RequireOtpVerified } from '../../common/decorators/auth.decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OtpVerifiedGuard } from '../../common/guards/otp-verified.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { AdClickDto, CreateRestaurantAdDto } from './dto/growth.dto';
import { MonetizationService } from './monetization.service';

@Controller('monetization')
@UseGuards(JwtAuthGuard, OtpVerifiedGuard, RolesGuard)
export class MonetizationController {
  constructor(private readonly monetizationService: MonetizationService) {}

  @Post('restaurant-ads')
  @RequireOtpVerified()
  createAd(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateRestaurantAdDto,
  ): Promise<RestaurantAdDto> {
    return this.monetizationService.createRestaurantAd(user.sub, dto);
  }

  @Get('restaurant-ads/mine')
  @RequireOtpVerified()
  listMyAds(@CurrentUser() user: JwtPayload): Promise<RestaurantAdDto[]> {
    return this.monetizationService.listRestaurantAds(user.sub);
  }

  @Public()
  @Get('restaurant-ads/active')
  listActiveAds(): Promise<RestaurantAdDto[]> {
    return this.monetizationService.listActiveAds();
  }

  @Public()
  @Post('restaurant-ads/:id/impression')
  recordImpression(@Param('id') adId: string): Promise<{ recorded: boolean }> {
    return this.monetizationService.recordAdImpression(adId).then(() => ({ recorded: true }));
  }

  @Public()
  @Post('restaurant-ads/:id/click')
  recordClick(
    @Param('id') adId: string,
    @Body() dto: AdClickDto,
  ): Promise<{ recorded: boolean }> {
    return this.monetizationService
      .recordAdClick(adId, dto.referrerUserId)
      .then(() => ({ recorded: true }));
  }

  @Get('affiliate/commissions')
  @RequireOtpVerified()
  listCommissions(
    @CurrentUser() user: JwtPayload,
  ): Promise<AffiliateCommissionsResponseDto> {
    return this.monetizationService.listAffiliateCommissions(user.sub);
  }
}
