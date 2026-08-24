import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import type {
  AuthResponseDto,
  MessageResponseDto,
  OtpRequestResponseDto,
} from '@bitemate/shared';
import { Public } from '../../common/decorators/auth.decorators';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import {
  FirebaseAuthDto,
  ForgotPasswordDto,
  LoginDto,
  OtpLoginRequestDto,
  OtpLoginVerifyDto,
  RefreshTokenDto,
  RegisterDto,
  RequestOtpDto,
  ResetPasswordDto,
  VerifyOtpDto,
  VerifyTwoFactorDto,
} from './dto/auth.dto';
import type { JwtPayload } from './types/jwt-payload.type';

function requestContext(req: Request) {
  const forwarded = req.headers['x-forwarded-for'];
  const ipAddress =
    typeof forwarded === 'string' && forwarded.length > 0
      ? forwarded.split(',')[0]!.trim()
      : req.ip;
  return {
    ipAddress,
    userAgent: req.headers['user-agent'],
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto, @Req() req: Request): Promise<AuthResponseDto> {
    return this.authService.register(dto, requestContext(req));
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto, @Req() req: Request): Promise<AuthResponseDto> {
    return this.authService.login(dto, requestContext(req));
  }

  @Public()
  @Post('firebase')
  @HttpCode(HttpStatus.OK)
  firebaseAuth(@Body() dto: FirebaseAuthDto): Promise<AuthResponseDto> {
    return this.authService.firebaseAuth(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Body() dto: RefreshTokenDto): Promise<{ message: string }> {
    return this.authService.logout(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  logoutAll(@CurrentUser() user: JwtPayload): Promise<{ message: string }> {
    return this.authService.logoutAll(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  requestOtp(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RequestOtpDto,
  ): Promise<OtpRequestResponseDto> {
    const destination = dto.email || dto.phoneNumber;
    if (!destination) {
      throw new BadRequestException('Email or phone number is required');
    }
    return this.authService.requestOtp(destination, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  verifyOtp(
    @CurrentUser() user: JwtPayload,
    @Body() dto: VerifyOtpDto,
  ): Promise<AuthResponseDto> {
    return this.authService.verifyOtp(dto, user.sub);
  }

  @Public()
  @Post('otp/login/request')
  @HttpCode(HttpStatus.OK)
  requestLoginOtp(@Body() dto: OtpLoginRequestDto): Promise<OtpRequestResponseDto> {
    return this.authService.requestLoginOtp(dto);
  }

  @Public()
  @Post('otp/login/verify')
  @HttpCode(HttpStatus.OK)
  verifyLoginOtp(@Body() dto: OtpLoginVerifyDto): Promise<AuthResponseDto> {
    return this.authService.verifyLoginOtp(dto);
  }

  @Public()
  @Post('password/forgot')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto): Promise<MessageResponseDto> {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto): Promise<MessageResponseDto> {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  verifyTwoFactor(@Body() dto: VerifyTwoFactorDto): Promise<AuthResponseDto> {
    return this.authService.verifyTwoFactorLogin(dto.challengeToken, dto.code);
  }
}
