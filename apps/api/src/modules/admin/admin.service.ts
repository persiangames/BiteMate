import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type UserRole, type WalletTransactionStatus, type WalletTransactionType } from '@prisma/client';
import {
  ADMIN_ROLE_PERMISSIONS,
  isAdminRole,
  type AdminAbuseReportDto,
  type AdminAbuseReportsResponseDto,
  type AdminAnalyticsDto,
  type AdminAuditLogDto,
  type AdminCommissionDto,
  type AdminCommissionsResponseDto,
  type AdminFraudLogDto,
  type AdminFraudLogsResponseDto,
  type AdminPermission,
  type AdminProfileDto,
  type AdminRestaurantDto,
  type AdminRestaurantsResponseDto,
  type AdminTransactionDto,
  type AdminTransactionsResponseDto,
  type AdminUserDto,
  type AdminUsersResponseDto,
  type AbuseReportStatus,
  type RestaurantApprovalStatus,
} from '@bitemate/shared';
import { PrismaService } from '../database/prisma.service';
import type {
  AdminFraudQueryDto,
  AdminListQueryDto,
  AdminReportsQueryDto,
  AdminRestaurantsQueryDto,
  AdminTransactionsQueryDto,
  AdminUsersQueryDto,
  CreateAbuseReportDto,
} from './dto/admin.dto';

const HIGH_RISK_THRESHOLD = 60;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string): Promise<AdminProfileDto> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, email: true, fullName: true, role: true, isActive: true },
    });

    if (!user.isActive || !isAdminRole(user.role)) {
      throw new ForbiddenException('Admin role required');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      permissions: ADMIN_ROLE_PERMISSIONS[user.role],
    };
  }

  assertPermission(role: string | null, permission: AdminPermission): void {
    if (!isAdminRole(role) || !ADMIN_ROLE_PERMISSIONS[role].includes(permission)) {
      throw new ForbiddenException('Insufficient admin permissions');
    }
  }

  async listUsers(query: AdminUsersQueryDto): Promise<AdminUsersResponseDto> {
    const { skip, take, page, limit } = this.page(query);
    const where: Prisma.UserWhereInput = {
      ...(query.role ? { role: query.role as UserRole } : {}),
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...(query.search
        ? {
            OR: [
              { email: { contains: query.search, mode: 'insensitive' } },
              { fullName: { contains: query.search, mode: 'insensitive' } },
              { username: { contains: query.search, mode: 'insensitive' } },
              { phoneNumber: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map((user) => this.toUserDto(user)),
      total,
      page,
      limit,
    };
  }

  async setUserBanned(
    adminId: string,
    adminRole: string | null,
    userId: string,
    banned: boolean,
    reason?: string,
  ): Promise<AdminUserDto> {
    if (adminId === userId) {
      throw new BadRequestException('You cannot ban your own account');
    }

    const target = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      throw new NotFoundException('User not found');
    }
    if (isAdminRole(target.role) && adminRole !== 'PLATFORM_ADMIN') {
      throw new ForbiddenException('Only platform admins can ban staff accounts');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: banned
          ? { isActive: false, tokenVersion: { increment: 1 } }
          : { isActive: true },
      });
      if (banned) {
        await tx.refreshToken.deleteMany({ where: { userId } });
      }
      return user;
    });

    await this.audit(adminId, banned ? 'USER_BAN' : 'USER_UNBAN', 'USER', userId, {
      reason,
    });

    return this.toUserDto(updated);
  }

  async setUserVerified(
    adminId: string,
    userId: string,
    verified: boolean,
  ): Promise<AdminUserDto> {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        adminVerified: verified,
        emailVerified: verified ? true : undefined,
        phoneVerified: verified ? true : undefined,
        otpVerified: verified ? true : undefined,
      },
    });

    await this.audit(adminId, verified ? 'USER_VERIFY' : 'USER_UNVERIFY', 'USER', userId);
    return this.toUserDto(updated);
  }

  async listRestaurants(query: AdminRestaurantsQueryDto): Promise<AdminRestaurantsResponseDto> {
    const { skip, take, page, limit } = this.page(query);
    const where: Prisma.RestaurantWhereInput = {
      ...(query.approvalStatus ? { approvalStatus: query.approvalStatus } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { city: { contains: query.search, mode: 'insensitive' } },
              { owner: { email: { contains: query.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.restaurant.findMany({
        where,
        include: {
          owner: { select: { fullName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.restaurant.count({ where }),
    ]);

    return {
      items: items.map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        ownerId: restaurant.ownerId,
        ownerName: restaurant.owner.fullName,
        ownerEmail: restaurant.owner.email,
        city: restaurant.city,
        country: restaurant.country,
        cuisineTypes: restaurant.cuisineTypes,
        averageRating: restaurant.averageRating,
        reviewCount: restaurant.reviewCount,
        isActive: restaurant.isActive,
        approvalStatus: restaurant.approvalStatus,
        isSponsored: restaurant.isSponsored,
        createdAt: restaurant.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }

  async updateRestaurantListing(
    adminId: string,
    restaurantId: string,
    input: { approvalStatus?: RestaurantApprovalStatus; isActive?: boolean },
  ): Promise<AdminRestaurantDto> {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { owner: { select: { fullName: true, email: true } } },
    });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const approvalStatus = input.approvalStatus ?? restaurant.approvalStatus;
    const isActive =
      input.isActive ??
      (approvalStatus === 'APPROVED' ? true : approvalStatus === 'REJECTED' ? false : restaurant.isActive);

    const updated = await this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: { approvalStatus, isActive },
      include: { owner: { select: { fullName: true, email: true } } },
    });

    await this.audit(adminId, 'RESTAURANT_UPDATE', 'RESTAURANT', restaurantId, {
      approvalStatus,
      isActive,
    });

    return {
      id: updated.id,
      name: updated.name,
      ownerId: updated.ownerId,
      ownerName: updated.owner.fullName,
      ownerEmail: updated.owner.email,
      city: updated.city,
      country: updated.country,
      cuisineTypes: updated.cuisineTypes,
      averageRating: updated.averageRating,
      reviewCount: updated.reviewCount,
      isActive: updated.isActive,
      approvalStatus: updated.approvalStatus,
      isSponsored: updated.isSponsored,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async listTransactions(query: AdminTransactionsQueryDto): Promise<AdminTransactionsResponseDto> {
    const { skip, take, page, limit } = this.page(query);
    const where: Prisma.WalletTransactionWhereInput = {
      ...(query.type ? { type: query.type as WalletTransactionType } : {}),
      ...(query.status ? { status: query.status as WalletTransactionStatus } : {}),
      ...(query.search
        ? {
            OR: [
              { user: { email: { contains: query.search, mode: 'insensitive' } } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.walletTransaction.findMany({
        where,
        include: { user: { select: { email: true, fullName: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.walletTransaction.count({ where }),
    ]);

    return {
      items: items.map((row) => this.toTransactionDto(row)),
      total,
      page,
      limit,
    };
  }

  async listPayouts(query: AdminListQueryDto): Promise<AdminTransactionsResponseDto> {
    return this.listTransactions({ ...query, type: 'WITHDRAWAL' });
  }

  async listCommissions(query: AdminListQueryDto): Promise<AdminCommissionsResponseDto> {
    const { skip, take, page, limit } = this.page(query);
    const where: Prisma.AffiliateCommissionWhereInput = query.search
      ? {
          referrer: { email: { contains: query.search, mode: 'insensitive' } },
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.affiliateCommission.findMany({
        where,
        include: { referrer: { select: { email: true, fullName: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.affiliateCommission.count({ where }),
    ]);

    return {
      items: items.map((row) => this.toCommissionDto(row)),
      total,
      page,
      limit,
    };
  }

  async updateCommissionStatus(
    adminId: string,
    commissionId: string,
    status: 'APPROVED' | 'PAID' | 'REJECTED',
  ): Promise<AdminCommissionDto> {
    const existing = await this.prisma.affiliateCommission.findUnique({
      where: { id: commissionId },
    });
    if (!existing) {
      throw new NotFoundException('Commission not found');
    }

    const updated = await this.prisma.affiliateCommission.update({
      where: { id: commissionId },
      data: { status },
      include: { referrer: { select: { email: true, fullName: true } } },
    });

    await this.audit(adminId, 'COMMISSION_UPDATE', 'COMMISSION', commissionId, { status });
    return this.toCommissionDto(updated);
  }

  async createAbuseReport(reporterId: string, dto: CreateAbuseReportDto): Promise<AdminAbuseReportDto> {
    const report = await this.prisma.abuseReport.create({
      data: {
        reporterId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        reason: dto.reason.trim(),
        details: dto.details?.trim(),
      },
      include: { reporter: { select: { email: true, fullName: true } } },
    });

    return this.toAbuseReportDto(report);
  }

  async listAbuseReports(query: AdminReportsQueryDto): Promise<AdminAbuseReportsResponseDto> {
    const { skip, take, page, limit } = this.page(query);
    const where: Prisma.AbuseReportWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { reason: { contains: query.search, mode: 'insensitive' } },
              { reporter: { email: { contains: query.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.abuseReport.findMany({
        where,
        include: { reporter: { select: { email: true, fullName: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.abuseReport.count({ where }),
    ]);

    return {
      items: items.map((row) => this.toAbuseReportDto(row)),
      total,
      page,
      limit,
    };
  }

  async updateAbuseReport(
    adminId: string,
    reportId: string,
    status: AbuseReportStatus,
    resolutionNote?: string,
  ): Promise<AdminAbuseReportDto> {
    const existing = await this.prisma.abuseReport.findUnique({ where: { id: reportId } });
    if (!existing) {
      throw new NotFoundException('Report not found');
    }

    const updated = await this.prisma.abuseReport.update({
      where: { id: reportId },
      data: {
        status,
        resolutionNote: resolutionNote?.trim(),
        reviewedById: adminId,
      },
      include: { reporter: { select: { email: true, fullName: true } } },
    });

    await this.audit(adminId, 'ABUSE_REPORT_UPDATE', 'ABUSE_REPORT', reportId, { status });
    return this.toAbuseReportDto(updated);
  }

  async listFraudLogs(query: AdminFraudQueryDto): Promise<AdminFraudLogsResponseDto> {
    const { skip, take, page, limit } = this.page(query);
    const minRisk = query.minRiskScore ?? 0;
    const where: Prisma.FraudLogWhereInput = {
      riskScore: { gte: minRisk },
      ...(query.search
        ? {
            OR: [
              { action: { contains: query.search, mode: 'insensitive' } },
              { user: { email: { contains: query.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [items, total, highRiskCount] = await this.prisma.$transaction([
      this.prisma.fraudLog.findMany({
        where,
        include: { user: { select: { email: true, fullName: true } } },
        orderBy: [{ riskScore: 'desc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      this.prisma.fraudLog.count({ where }),
      this.prisma.fraudLog.count({ where: { riskScore: { gte: HIGH_RISK_THRESHOLD } } }),
    ]);

    return {
      items: items.map((row) => this.toFraudDto(row)),
      total,
      highRiskCount,
      page,
      limit,
    };
  }

  async getAnalytics(): Promise<AdminAnalyticsDto> {
    const now = new Date();
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const last7 = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);
    const last30 = new Date(startOfToday.getTime() - 29 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newToday,
      premium,
      banned,
      meetupGroups,
      meetupsToday,
      restaurantGroups,
      feesToday,
      fees7,
      fees30,
      premium30,
      ads30,
      pendingPayouts,
      openAbuse,
      highRiskFraud,
      activeTodayRows,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
      this.prisma.user.count({ where: { isPremium: true, isActive: true } }),
      this.prisma.user.count({ where: { isActive: false } }),
      this.prisma.foodMeetup.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.foodMeetup.count({ where: { createdAt: { gte: startOfToday } } }),
      this.prisma.restaurant.groupBy({ by: ['approvalStatus'], _count: { _all: true } }),
      this.sumFees(startOfToday),
      this.sumFees(last7),
      this.sumFees(last30),
      this.sumPremium(last30),
      this.sumAds(last30),
      this.prisma.affiliateCommission.aggregate({
        where: { status: { in: ['PENDING', 'APPROVED'] } },
        _sum: { amount: true },
      }),
      this.prisma.abuseReport.count({ where: { status: { in: ['OPEN', 'REVIEWING'] } } }),
      this.prisma.fraudLog.count({ where: { riskScore: { gte: HIGH_RISK_THRESHOLD } } }),
      this.prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(DISTINCT uid)::bigint AS count FROM (
          SELECT "author_id" AS uid FROM posts WHERE "created_at" >= ${startOfToday}
          UNION
          SELECT "user_id" AS uid FROM wallet_transactions WHERE "created_at" >= ${startOfToday}
          UNION
          SELECT "creator_id" AS uid FROM food_meetups WHERE "created_at" >= ${startOfToday}
          UNION
          SELECT "user_id" AS uid FROM food_intents WHERE "created_at" >= ${startOfToday}
          UNION
          SELECT id AS uid FROM users WHERE "last_live_location_at" >= ${startOfToday}
        ) activity
      `,
    ]);

    const meetupCount = (status: string) =>
      meetupGroups.find((row) => row.status === status)?._count._all ?? 0;
    const restaurantCount = (status: RestaurantApprovalStatus) =>
      restaurantGroups.find((row) => row.approvalStatus === status)?._count._all ?? 0;

    const fees = this.decimal(fees30._sum.fee);
    const premiumRevenue = this.decimal(premium30._sum.amount);
    const adSpend = this.decimal(ads30._sum.spent);

    return {
      generatedAt: now.toISOString(),
      users: {
        total: totalUsers,
        activeToday: Number(activeTodayRows[0]?.count ?? 0),
        newToday,
        premium,
        banned,
      },
      meetups: {
        total: meetupGroups.reduce((sum, row) => sum + row._count._all, 0),
        open: meetupCount('OPEN'),
        scheduled: meetupCount('SCHEDULED'),
        completed: meetupCount('COMPLETED'),
        cancelled: meetupCount('CANCELLED'),
        createdToday: meetupsToday,
      },
      restaurants: {
        total: restaurantGroups.reduce((sum, row) => sum + row._count._all, 0),
        pending: restaurantCount('PENDING'),
        approved: restaurantCount('APPROVED'),
        rejected: restaurantCount('REJECTED'),
      },
      revenue: {
        currency: 'USD',
        today: this.decimal(feesToday._sum.fee) + this.decimal(
          (await this.sumPremium(startOfToday))._sum.amount,
        ),
        last7Days: this.decimal(fees7._sum.fee),
        last30Days: fees + premiumRevenue + adSpend,
        fees,
        premium: premiumRevenue,
        ads: adSpend,
        pendingPayouts: this.decimal(pendingPayouts._sum.amount),
      },
      reports: {
        openAbuse,
        highRiskFraud,
      },
    };
  }

  async recentAuditLogs(): Promise<AdminAuditLogDto[]> {
    const logs = await this.prisma.adminAuditLog.findMany({
      include: { admin: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });

    return logs.map((log) => ({
      id: log.id,
      adminId: log.adminId,
      adminEmail: log.admin.email,
      action: log.action,
      targetType: log.targetType,
      targetId: log.targetId,
      createdAt: log.createdAt.toISOString(),
    }));
  }

  private async sumFees(since: Date) {
    return this.prisma.walletTransaction.aggregate({
      where: { status: 'COMPLETED', createdAt: { gte: since } },
      _sum: { fee: true },
    });
  }

  private async sumPremium(since: Date) {
    return this.prisma.premiumSubscription.aggregate({
      where: { createdAt: { gte: since } },
      _sum: { amount: true },
    });
  }

  private async sumAds(since: Date) {
    return this.prisma.restaurantAd.aggregate({
      where: { createdAt: { gte: since } },
      _sum: { spent: true },
    });
  }

  private async audit(
    adminId: string,
    action: string,
    targetType: string,
    targetId?: string,
    details?: Record<string, unknown>,
  ): Promise<void> {
    await this.prisma.adminAuditLog.create({
      data: {
        adminId,
        action,
        targetType,
        targetId,
        details: details as Prisma.InputJsonValue | undefined,
      },
    });
  }

  private page(query: { page?: number; limit?: number }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return { page, limit, skip: (page - 1) * limit, take: limit };
  }

  private decimal(value: Prisma.Decimal | number | null | undefined): number {
    if (value === null || value === undefined) {
      return 0;
    }
    return typeof value === 'number' ? value : Number(value);
  }

  private toUserDto(user: {
    id: string;
    email: string | null;
    phoneNumber: string | null;
    fullName: string | null;
    username: string | null;
    role: AdminUserDto['role'];
    city: string | null;
    country: string | null;
    isActive: boolean;
    adminVerified: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    otpVerified: boolean;
    isPremium: boolean;
    level: number;
    rankScore: number;
    successfulMeetups: number;
    createdAt: Date;
  }): AdminUserDto {
    return {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      username: user.username,
      role: user.role,
      city: user.city,
      country: user.country,
      isActive: user.isActive,
      adminVerified: user.adminVerified,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      otpVerified: user.otpVerified,
      isPremium: user.isPremium,
      level: user.level,
      rankScore: user.rankScore,
      successfulMeetups: user.successfulMeetups,
      createdAt: user.createdAt.toISOString(),
    };
  }

  private toTransactionDto(row: {
    id: string;
    userId: string;
    user: { email: string | null; fullName: string | null };
    type: AdminTransactionDto['type'];
    status: AdminTransactionDto['status'];
    amount: Prisma.Decimal;
    fee: Prisma.Decimal;
    netAmount: Prisma.Decimal;
    currency: string;
    description: string | null;
    createdAt: Date;
    completedAt: Date | null;
  }): AdminTransactionDto {
    return {
      id: row.id,
      userId: row.userId,
      userEmail: row.user.email,
      userName: row.user.fullName,
      type: row.type,
      status: row.status,
      amount: this.decimal(row.amount),
      fee: this.decimal(row.fee),
      netAmount: this.decimal(row.netAmount),
      currency: row.currency,
      description: row.description,
      createdAt: row.createdAt.toISOString(),
      completedAt: row.completedAt?.toISOString() ?? null,
    };
  }

  private toCommissionDto(row: {
    id: string;
    referrerUserId: string;
    referrer: { email: string | null; fullName: string | null };
    sourceType: string;
    sourceId: string;
    amount: Prisma.Decimal;
    currency: string;
    status: string;
    createdAt: Date;
  }): AdminCommissionDto {
    return {
      id: row.id,
      referrerUserId: row.referrerUserId,
      referrerEmail: row.referrer.email,
      referrerName: row.referrer.fullName,
      sourceType: row.sourceType,
      sourceId: row.sourceId,
      amount: this.decimal(row.amount),
      currency: row.currency,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
    };
  }

  private toAbuseReportDto(row: {
    id: string;
    reporterId: string;
    reporter: { email: string | null; fullName: string | null };
    targetType: AdminAbuseReportDto['targetType'];
    targetId: string;
    reason: string;
    details: string | null;
    status: AdminAbuseReportDto['status'];
    reviewedById: string | null;
    resolutionNote: string | null;
    createdAt: Date;
  }): AdminAbuseReportDto {
    return {
      id: row.id,
      reporterId: row.reporterId,
      reporterEmail: row.reporter.email,
      reporterName: row.reporter.fullName,
      targetType: row.targetType,
      targetId: row.targetId,
      reason: row.reason,
      details: row.details,
      status: row.status,
      reviewedById: row.reviewedById,
      resolutionNote: row.resolutionNote,
      createdAt: row.createdAt.toISOString(),
    };
  }

  private toFraudDto(row: {
    id: string;
    userId: string;
    user: { email: string | null; fullName: string | null };
    action: string;
    ipAddress: string | null;
    riskScore: number;
    details: Prisma.JsonValue;
    createdAt: Date;
  }): AdminFraudLogDto {
    return {
      id: row.id,
      userId: row.userId,
      userEmail: row.user.email,
      userName: row.user.fullName,
      action: row.action,
      ipAddress: row.ipAddress,
      riskScore: row.riskScore,
      details:
        row.details && typeof row.details === 'object' && !Array.isArray(row.details)
          ? (row.details as Record<string, unknown>)
          : null,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
