import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import type {
  BankAccountDto,
  DepositResponseDto,
  WalletBalanceResponseDto,
  WalletTransactionDto,
  WalletTransactionsResponseDto,
} from '@bitemate/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireOtpVerified } from '../../common/decorators/auth.decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OtpVerifiedGuard } from '../../common/guards/otp-verified.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import {
  CreateBankAccountDto,
  DepositDto,
  TransactionsQueryDto,
  TransferDto,
  VerifyBankAccountDto,
  WithdrawDto,
} from './dto/wallet.dto';
import { WalletService } from './wallet.service';

function requestContext(req: Request) {
  return {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };
}

@Controller()
@UseGuards(JwtAuthGuard, OtpVerifiedGuard, RolesGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('wallet/balance')
  @RequireOtpVerified()
  getBalance(@CurrentUser() user: JwtPayload): Promise<WalletBalanceResponseDto> {
    return this.walletService.getBalance(user.sub);
  }

  @Post('wallet/deposit')
  @RequireOtpVerified()
  deposit(
    @CurrentUser() user: JwtPayload,
    @Body() dto: DepositDto,
    @Req() req: Request,
  ): Promise<DepositResponseDto> {
    return this.walletService.deposit(user.sub, dto, requestContext(req));
  }

  @Post('wallet/withdraw')
  @RequireOtpVerified()
  withdraw(
    @CurrentUser() user: JwtPayload,
    @Body() dto: WithdrawDto,
    @Req() req: Request,
  ): Promise<WalletTransactionDto> {
    return this.walletService.withdraw(user.sub, dto, requestContext(req));
  }

  @Post('wallet/transfer')
  @RequireOtpVerified()
  transfer(
    @CurrentUser() user: JwtPayload,
    @Body() dto: TransferDto,
    @Req() req: Request,
  ): Promise<WalletTransactionDto> {
    return this.walletService.transfer(user.sub, dto, requestContext(req));
  }

  @Get('wallet/transactions')
  @RequireOtpVerified()
  listTransactions(
    @CurrentUser() user: JwtPayload,
    @Query() query: TransactionsQueryDto,
  ): Promise<WalletTransactionsResponseDto> {
    return this.walletService.listTransactions(user.sub, query.cursor, query.limit);
  }

  @Get('wallet/bank-accounts')
  @RequireOtpVerified()
  listBankAccounts(@CurrentUser() user: JwtPayload): Promise<BankAccountDto[]> {
    return this.walletService.listBankAccounts(user.sub);
  }

  @Post('wallet/bank-accounts')
  @RequireOtpVerified()
  addBankAccount(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateBankAccountDto,
  ): Promise<BankAccountDto & { verificationCode?: string }> {
    return this.walletService.addBankAccount(user.sub, dto);
  }

  @Post('wallet/bank-accounts/:id/verify')
  @RequireOtpVerified()
  verifyBankAccount(
    @CurrentUser() user: JwtPayload,
    @Param('id') bankAccountId: string,
    @Body() dto: VerifyBankAccountDto,
  ): Promise<BankAccountDto> {
    return this.walletService.verifyBankAccount(user.sub, bankAccountId, dto);
  }

  @Patch('wallet/bank-accounts/:id/default')
  @RequireOtpVerified()
  setDefaultBankAccount(
    @CurrentUser() user: JwtPayload,
    @Param('id') bankAccountId: string,
  ): Promise<BankAccountDto> {
    return this.walletService.setDefaultBankAccount(user.sub, bankAccountId);
  }
}
