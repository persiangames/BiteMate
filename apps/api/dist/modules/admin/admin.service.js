"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@bitemate/shared");
const prisma_service_1 = require("../database/prisma.service");
const HIGH_RISK_THRESHOLD = 60;
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMe(userId) {
        const user = await this.prisma.user.findUniqueOrThrow({
            where: { id: userId },
            select: { id: true, email: true, fullName: true, role: true, isActive: true },
        });
        if (!user.isActive || !(0, shared_1.isAdminRole)(user.role)) {
            throw new common_1.ForbiddenException('Admin role required');
        }
        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            permissions: shared_1.ADMIN_ROLE_PERMISSIONS[user.role],
        };
    }
    assertPermission(role, permission) {
        if (!(0, shared_1.isAdminRole)(role) || !shared_1.ADMIN_ROLE_PERMISSIONS[role].includes(permission)) {
            throw new common_1.ForbiddenException('Insufficient admin permissions');
        }
    }
    async listUsers(query) {
        const { skip, take, page, limit } = this.page(query);
        const where = {
            ...(query.role ? { role: query.role } : {}),
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
    async setUserBanned(adminId, adminRole, userId, banned, reason) {
        if (adminId === userId) {
            throw new common_1.BadRequestException('You cannot ban your own account');
        }
        const target = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!target) {
            throw new common_1.NotFoundException('User not found');
        }
        if ((0, shared_1.isAdminRole)(target.role) && adminRole !== 'PLATFORM_ADMIN') {
            throw new common_1.ForbiddenException('Only platform admins can ban staff accounts');
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
    async setUserVerified(adminId, userId, verified) {
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
    async listRestaurants(query) {
        const { skip, take, page, limit } = this.page(query);
        const where = {
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
    async updateRestaurantListing(adminId, restaurantId, input) {
        const restaurant = await this.prisma.restaurant.findUnique({
            where: { id: restaurantId },
            include: { owner: { select: { fullName: true, email: true } } },
        });
        if (!restaurant) {
            throw new common_1.NotFoundException('Restaurant not found');
        }
        const approvalStatus = input.approvalStatus ?? restaurant.approvalStatus;
        const isActive = input.isActive ??
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
    async listTransactions(query) {
        const { skip, take, page, limit } = this.page(query);
        const where = {
            ...(query.type ? { type: query.type } : {}),
            ...(query.status ? { status: query.status } : {}),
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
    async listPayouts(query) {
        return this.listTransactions({ ...query, type: 'WITHDRAWAL' });
    }
    async listCommissions(query) {
        const { skip, take, page, limit } = this.page(query);
        const where = query.search
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
    async updateCommissionStatus(adminId, commissionId, status) {
        const existing = await this.prisma.affiliateCommission.findUnique({
            where: { id: commissionId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Commission not found');
        }
        const updated = await this.prisma.affiliateCommission.update({
            where: { id: commissionId },
            data: { status },
            include: { referrer: { select: { email: true, fullName: true } } },
        });
        await this.audit(adminId, 'COMMISSION_UPDATE', 'COMMISSION', commissionId, { status });
        return this.toCommissionDto(updated);
    }
    async createAbuseReport(reporterId, dto) {
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
    async listAbuseReports(query) {
        const { skip, take, page, limit } = this.page(query);
        const where = {
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
    async updateAbuseReport(adminId, reportId, status, resolutionNote) {
        const existing = await this.prisma.abuseReport.findUnique({ where: { id: reportId } });
        if (!existing) {
            throw new common_1.NotFoundException('Report not found');
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
    async listFraudLogs(query) {
        const { skip, take, page, limit } = this.page(query);
        const minRisk = query.minRiskScore ?? 0;
        const where = {
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
    async getAnalytics() {
        const now = new Date();
        const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const last7 = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);
        const last30 = new Date(startOfToday.getTime() - 29 * 24 * 60 * 60 * 1000);
        const [totalUsers, newToday, premium, banned, meetupGroups, meetupsToday, restaurantGroups, feesToday, fees7, fees30, premium30, ads30, pendingPayouts, openAbuse, highRiskFraud, activeTodayRows,] = await Promise.all([
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
            this.prisma.$queryRaw `
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
        const meetupCount = (status) => meetupGroups.find((row) => row.status === status)?._count._all ?? 0;
        const restaurantCount = (status) => restaurantGroups.find((row) => row.approvalStatus === status)?._count._all ?? 0;
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
                today: this.decimal(feesToday._sum.fee) + this.decimal((await this.sumPremium(startOfToday))._sum.amount),
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
    async recentAuditLogs() {
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
    async sumFees(since) {
        return this.prisma.walletTransaction.aggregate({
            where: { status: 'COMPLETED', createdAt: { gte: since } },
            _sum: { fee: true },
        });
    }
    async sumPremium(since) {
        return this.prisma.premiumSubscription.aggregate({
            where: { createdAt: { gte: since } },
            _sum: { amount: true },
        });
    }
    async sumAds(since) {
        return this.prisma.restaurantAd.aggregate({
            where: { createdAt: { gte: since } },
            _sum: { spent: true },
        });
    }
    async audit(adminId, action, targetType, targetId, details) {
        await this.prisma.adminAuditLog.create({
            data: {
                adminId,
                action,
                targetType,
                targetId,
                details: details,
            },
        });
    }
    page(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        return { page, limit, skip: (page - 1) * limit, take: limit };
    }
    decimal(value) {
        if (value === null || value === undefined) {
            return 0;
        }
        return typeof value === 'number' ? value : Number(value);
    }
    toUserDto(user) {
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
    toTransactionDto(row) {
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
    toCommissionDto(row) {
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
    toAbuseReportDto(row) {
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
    toFraudDto(row) {
        return {
            id: row.id,
            userId: row.userId,
            userEmail: row.user.email,
            userName: row.user.fullName,
            action: row.action,
            ipAddress: row.ipAddress,
            riskScore: row.riskScore,
            details: row.details && typeof row.details === 'object' && !Array.isArray(row.details)
                ? row.details
                : null,
            createdAt: row.createdAt.toISOString(),
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map