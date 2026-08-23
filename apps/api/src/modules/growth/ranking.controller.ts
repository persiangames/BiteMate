import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import type {
  RestaurantRankingsResponseDto,
  UserRankingsResponseDto,
} from '@bitemate/shared';
import { Public } from '../../common/decorators/auth.decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OtpVerifiedGuard } from '../../common/guards/otp-verified.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RankingsQueryDto } from './dto/growth.dto';
import { RankingService } from './ranking.service';

@Controller('ranking')
@UseGuards(JwtAuthGuard, OtpVerifiedGuard, RolesGuard)
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Public()
  @Get('users')
  getUserRankings(@Query() query: RankingsQueryDto): Promise<UserRankingsResponseDto> {
    return this.rankingService.getUserRankings(query);
  }

  @Public()
  @Get('restaurants')
  getRestaurantRankings(
    @Query() query: RankingsQueryDto,
  ): Promise<RestaurantRankingsResponseDto> {
    return this.rankingService.getRestaurantRankings(query);
  }
}
