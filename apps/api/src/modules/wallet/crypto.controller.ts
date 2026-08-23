import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import type { CryptoAddressDto, WalletTransactionDto } from '@bitemate/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireOtpVerified } from '../../common/decorators/auth.decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OtpVerifiedGuard } from '../../common/guards/otp-verified.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CryptoWithdrawDto } from './dto/wallet.dto';
import { WalletService } from './wallet.service';

@Controller()
@UseGuards(JwtAuthGuard, OtpVerifiedGuard, RolesGuard)
export class CryptoController {
  constructor(private readonly walletService: WalletService) {}

  @Get('crypto/addresses')
  @RequireOtpVerified()
  listAddresses(@CurrentUser() user: JwtPayload): Promise<CryptoAddressDto[]> {
    return this.walletService.listCryptoAddresses(user.sub);
  }

  @Post('crypto/withdraw')
  @RequireOtpVerified()
  withdraw(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CryptoWithdrawDto,
    @Req() req: Request,
  ): Promise<WalletTransactionDto> {
    return this.walletService.cryptoWithdraw(user.sub, dto, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
}
