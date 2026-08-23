import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import type {
  AdminAbuseReportDto,
  AdminAbuseReportsResponseDto,
  AdminAnalyticsDto,
  AdminAuditLogDto,
  AdminCommissionDto,
  AdminCommissionsResponseDto,
  AdminFraudLogsResponseDto,
  AdminProfileDto,
  AdminRestaurantsResponseDto,
  AdminRestaurantDto,
  AdminTransactionsResponseDto,
  AdminUserDto,
  AdminUsersResponseDto,
} from '@bitemate/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/auth.decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { AdminService } from './admin.service';
import {
  AdminFraudQueryDto,
  AdminListQueryDto,
  AdminReportsQueryDto,
  AdminRestaurantsQueryDto,
  AdminTransactionsQueryDto,
  AdminUsersQueryDto,
  BanUserDto,
  UpdateAbuseReportDto,
  UpdateCommissionStatusDto,
  UpdateRestaurantListingDto,
  VerifyUserDto,
} from './dto/admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PLATFORM_ADMIN', 'MODERATOR')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('me')
  getMe(@CurrentUser() user: JwtPayload): Promise<AdminProfileDto> {
    return this.adminService.getMe(user.sub);
  }

  @Get('analytics')
  getAnalytics(@CurrentUser() user: JwtPayload): Promise<AdminAnalyticsDto> {
    this.adminService.assertPermission(user.role, 'analytics');
    return this.adminService.getAnalytics();
  }

  @Get('audit')
  getAudit(@CurrentUser() user: JwtPayload): Promise<AdminAuditLogDto[]> {
    this.adminService.assertPermission(user.role, 'analytics');
    return this.adminService.recentAuditLogs();
  }

  @Get('users')
  listUsers(
    @CurrentUser() user: JwtPayload,
    @Query() query: AdminUsersQueryDto,
  ): Promise<AdminUsersResponseDto> {
    this.adminService.assertPermission(user.role, 'users');
    return this.adminService.listUsers(query);
  }

  @Patch('users/:id/ban')
  banUser(
    @CurrentUser() user: JwtPayload,
    @Param('id') userId: string,
    @Body() dto: BanUserDto,
  ): Promise<AdminUserDto> {
    this.adminService.assertPermission(user.role, 'users');
    return this.adminService.setUserBanned(user.sub, user.role, userId, dto.banned, dto.reason);
  }

  @Patch('users/:id/verify')
  verifyUser(
    @CurrentUser() user: JwtPayload,
    @Param('id') userId: string,
    @Body() dto: VerifyUserDto,
  ): Promise<AdminUserDto> {
    this.adminService.assertPermission(user.role, 'users');
    return this.adminService.setUserVerified(user.sub, userId, dto.verified);
  }

  @Get('restaurants')
  listRestaurants(
    @CurrentUser() user: JwtPayload,
    @Query() query: AdminRestaurantsQueryDto,
  ): Promise<AdminRestaurantsResponseDto> {
    this.adminService.assertPermission(user.role, 'restaurants');
    return this.adminService.listRestaurants(query);
  }

  @Patch('restaurants/:id')
  updateRestaurant(
    @CurrentUser() user: JwtPayload,
    @Param('id') restaurantId: string,
    @Body() dto: UpdateRestaurantListingDto,
  ): Promise<AdminRestaurantDto> {
    this.adminService.assertPermission(user.role, 'restaurants');
    return this.adminService.updateRestaurantListing(user.sub, restaurantId, dto);
  }

  @Get('finance/transactions')
  listTransactions(
    @CurrentUser() user: JwtPayload,
    @Query() query: AdminTransactionsQueryDto,
  ): Promise<AdminTransactionsResponseDto> {
    this.adminService.assertPermission(user.role, 'finance');
    return this.adminService.listTransactions(query);
  }

  @Get('finance/payouts')
  listPayouts(
    @CurrentUser() user: JwtPayload,
    @Query() query: AdminListQueryDto,
  ): Promise<AdminTransactionsResponseDto> {
    this.adminService.assertPermission(user.role, 'finance');
    return this.adminService.listPayouts(query);
  }

  @Get('finance/commissions')
  listCommissions(
    @CurrentUser() user: JwtPayload,
    @Query() query: AdminListQueryDto,
  ): Promise<AdminCommissionsResponseDto> {
    this.adminService.assertPermission(user.role, 'finance');
    return this.adminService.listCommissions(query);
  }

  @Patch('finance/commissions/:id')
  @Roles('PLATFORM_ADMIN')
  updateCommission(
    @CurrentUser() user: JwtPayload,
    @Param('id') commissionId: string,
    @Body() dto: UpdateCommissionStatusDto,
  ): Promise<AdminCommissionDto> {
    this.adminService.assertPermission(user.role, 'finance');
    return this.adminService.updateCommissionStatus(user.sub, commissionId, dto.status);
  }

  @Get('reports')
  listReports(
    @CurrentUser() user: JwtPayload,
    @Query() query: AdminReportsQueryDto,
  ): Promise<AdminAbuseReportsResponseDto> {
    this.adminService.assertPermission(user.role, 'reports');
    return this.adminService.listAbuseReports(query);
  }

  @Patch('reports/:id')
  updateReport(
    @CurrentUser() user: JwtPayload,
    @Param('id') reportId: string,
    @Body() dto: UpdateAbuseReportDto,
  ): Promise<AdminAbuseReportDto> {
    this.adminService.assertPermission(user.role, 'reports');
    return this.adminService.updateAbuseReport(user.sub, reportId, dto.status, dto.resolutionNote);
  }

  @Get('fraud')
  listFraud(
    @CurrentUser() user: JwtPayload,
    @Query() query: AdminFraudQueryDto,
  ): Promise<AdminFraudLogsResponseDto> {
    this.adminService.assertPermission(user.role, 'reports');
    return this.adminService.listFraudLogs(query);
  }
}
