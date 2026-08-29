import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import type {
  CreateFoodIntentResponseDto,
  FoodIntentDto,
  FoodIntentListResponseDto,
  IntentDailyLimitDto,
  IntentMatchesResponseDto,
} from '@bitemate/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireOtpVerified } from '../../common/decorators/auth.decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OtpVerifiedGuard } from '../../common/guards/otp-verified.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CancelIntentDto, CreateIntentDto, IntentMatchQueryDto } from './dto/intent.dto';
import { IntentService } from './intent.service';

@Controller()
@UseGuards(JwtAuthGuard, OtpVerifiedGuard, RolesGuard)
export class IntentController {
  constructor(private readonly intentService: IntentService) {}

  @Post('intent/create')
  @RequireOtpVerified()
  createIntent(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateIntentDto,
  ): Promise<CreateFoodIntentResponseDto> {
    return this.intentService.createIntent(user.sub, dto);
  }

  @Get('intent/matches')
  @RequireOtpVerified()
  getMatches(
    @CurrentUser() user: JwtPayload,
    @Query() query: IntentMatchQueryDto,
  ): Promise<IntentMatchesResponseDto> {
    return this.intentService.getMatches(user.sub, query.intentId);
  }

  @Post('intent/cancel')
  @RequireOtpVerified()
  cancelIntent(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CancelIntentDto,
  ): Promise<FoodIntentDto> {
    return this.intentService.cancelIntent(user.sub, dto.intentId);
  }

  @Get('intent/me')
  @RequireOtpVerified()
  listMyIntents(@CurrentUser() user: JwtPayload): Promise<FoodIntentListResponseDto> {
    return this.intentService.listMyIntents(user.sub);
  }

  @Get('intent/limit')
  @RequireOtpVerified()
  getDailyLimit(@CurrentUser() user: JwtPayload): Promise<IntentDailyLimitDto> {
    return this.intentService.getDailyLimit(user.sub);
  }
}
