import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import type {
  AuthUserDto,
  OtpRequestResponseDto,
  ProfileMeetupHistoryDto,
  PublicUserDto,
  UsernameAvailableResponseDto,
  UserSearchHitDto,
} from '@bitemate/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireOtpVerified } from '../../common/decorators/auth.decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OtpVerifiedGuard } from '../../common/guards/otp-verified.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import {
  ChangePasswordDto,
  DeleteAccountConfirmDto,
  DeleteAccountRequestDto,
  DisableTwoFactorDto,
  EnableTwoFactorDto,
  RequestContactChangeDto,
  SearchUsersQueryDto,
  UpdateLocaleDto,
  UpdateProfileDto,
  UpdateThemeDto,
  UsernameQueryDto,
  VerifyContactChangeDto,
} from '../auth/dto/auth.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, OtpVerifiedGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: JwtPayload): Promise<AuthUserDto> {
    return this.usersService.getProfile(user.sub);
  }

  @Get('username-available')
  checkUsername(
    @CurrentUser() user: JwtPayload,
    @Query() query: UsernameQueryDto,
  ): Promise<UsernameAvailableResponseDto> {
    return this.usersService.isUsernameAvailable(query.username, user.sub);
  }

  @Get('search')
  @RequireOtpVerified()
  searchUsers(
    @Query('q') rawQuery: string,
    @Query() query: SearchUsersQueryDto,
  ): Promise<UserSearchHitDto[]> {
    const usernameOnly = typeof rawQuery === 'string' && rawQuery.trim().startsWith('@');
    return this.usersService.searchUsers(query.q, 20, usernameOnly);
  }

  @Get('by-username/:username')
  @RequireOtpVerified()
  getPublicProfile(
    @CurrentUser() user: JwtPayload,
    @Param('username') username: string,
  ): Promise<PublicUserDto> {
    return this.usersService.getPublicProfile(username, user.sub);
  }

  @Get('id/:userId/public')
  @RequireOtpVerified()
  getPublicProfileById(
    @CurrentUser() user: JwtPayload,
    @Param('userId') userId: string,
  ): Promise<PublicUserDto> {
    return this.usersService.getPublicProfileById(userId, user.sub);
  }

  @Get('id/:userId/meetups')
  @RequireOtpVerified()
  listMeetupHistory(
    @Param('userId') userId: string,
    @Query('kind') kind?: string,
  ): Promise<ProfileMeetupHistoryDto> {
    const resolved = kind === 'attended' ? 'attended' : 'hosted';
    return this.usersService.listMeetupHistory(userId, resolved);
  }

  @Patch('me')
  @RequireOtpVerified()
  updateProfilePatch(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ): Promise<AuthUserDto> {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Put('me')
  @RequireOtpVerified()
  updateProfilePut(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ): Promise<AuthUserDto> {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Post('me/contact/request')
  @RequireOtpVerified()
  @HttpCode(HttpStatus.OK)
  requestContactChange(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RequestContactChangeDto,
  ): Promise<OtpRequestResponseDto> {
    return this.usersService.requestContactChange(user.sub, dto);
  }

  @Post('me/contact/verify')
  @RequireOtpVerified()
  @HttpCode(HttpStatus.OK)
  verifyContactChange(
    @CurrentUser() user: JwtPayload,
    @Body() dto: VerifyContactChangeDto,
  ): Promise<AuthUserDto> {
    return this.usersService.verifyContactChange(user.sub, dto);
  }

  @Patch('me/locale')
  updateLocale(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateLocaleDto,
  ): Promise<AuthUserDto> {
    return this.usersService.updateLocale(user.sub, dto);
  }

  @Patch('me/theme')
  updateTheme(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateThemeDto,
  ): Promise<AuthUserDto> {
    return this.usersService.updateTheme(user.sub, dto);
  }

  @Post('me/password')
  @RequireOtpVerified()
  @HttpCode(HttpStatus.OK)
  changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.usersService.changePassword(user.sub, dto);
  }

  @Post('me/2fa/setup')
  @RequireOtpVerified()
  @HttpCode(HttpStatus.OK)
  setupTwoFactor(@CurrentUser() user: JwtPayload) {
    return this.usersService.setupTwoFactor(user.sub);
  }

  @Post('me/2fa/enable')
  @RequireOtpVerified()
  @HttpCode(HttpStatus.OK)
  enableTwoFactor(
    @CurrentUser() user: JwtPayload,
    @Body() dto: EnableTwoFactorDto,
  ): Promise<AuthUserDto> {
    return this.usersService.enableTwoFactor(user.sub, dto);
  }

  @Post('me/2fa/disable')
  @RequireOtpVerified()
  @HttpCode(HttpStatus.OK)
  disableTwoFactor(
    @CurrentUser() user: JwtPayload,
    @Body() dto: DisableTwoFactorDto,
  ): Promise<AuthUserDto> {
    return this.usersService.disableTwoFactor(user.sub, dto);
  }

  @Post('me/delete/request')
  @RequireOtpVerified()
  @HttpCode(HttpStatus.OK)
  requestDelete(
    @CurrentUser() user: JwtPayload,
    @Body() dto: DeleteAccountRequestDto,
  ): Promise<OtpRequestResponseDto> {
    return this.usersService.requestAccountDeletion(user.sub, dto);
  }

  @Post('me/delete/confirm')
  @RequireOtpVerified()
  @HttpCode(HttpStatus.OK)
  confirmDelete(
    @CurrentUser() user: JwtPayload,
    @Body() dto: DeleteAccountConfirmDto,
  ): Promise<{ message: string }> {
    return this.usersService.confirmAccountDeletion(user.sub, dto);
  }

  @Get('me/full-access-check')
  @RequireOtpVerified()
  fullAccessCheck(@CurrentUser() user: JwtPayload): { ok: true; userId: string } {
    return { ok: true, userId: user.sub };
  }
}
