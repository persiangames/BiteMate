import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import type { EscrowHoldDto } from '@bitemate/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireOtpVerified } from '../../common/decorators/auth.decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OtpVerifiedGuard } from '../../common/guards/otp-verified.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CreateEscrowDto, ReleaseEscrowDto } from './dto/wallet.dto';
import { EscrowService } from './escrow.service';

@Controller('escrow')
@UseGuards(JwtAuthGuard, OtpVerifiedGuard, RolesGuard)
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post('hold')
  @RequireOtpVerified()
  createHold(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateEscrowDto,
    @Req() req: Request,
  ): Promise<EscrowHoldDto> {
    return this.escrowService.createHold(user.sub, dto, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post(':id/release')
  @RequireOtpVerified()
  release(
    @CurrentUser() user: JwtPayload,
    @Param('id') escrowId: string,
    @Body() dto: ReleaseEscrowDto,
  ): Promise<EscrowHoldDto> {
    return this.escrowService.releaseEscrow(user.sub, escrowId, dto);
  }

  @Post(':id/refund')
  @RequireOtpVerified()
  refund(
    @CurrentUser() user: JwtPayload,
    @Param('id') escrowId: string,
  ): Promise<EscrowHoldDto> {
    return this.escrowService.refundEscrow(user.sub, escrowId);
  }
}
