import { type AdminAbuseReportDto, type AdminAbuseReportsResponseDto, type AdminAnalyticsDto, type AdminAuditLogDto, type AdminCommissionDto, type AdminCommissionsResponseDto, type AdminFraudLogsResponseDto, type AdminPermission, type AdminProfileDto, type AdminRestaurantDto, type AdminRestaurantsResponseDto, type AdminTransactionsResponseDto, type AdminUserDto, type AdminUsersResponseDto, type AbuseReportStatus, type RestaurantApprovalStatus } from '@bitemate/shared';
import { PrismaService } from '../database/prisma.service';
import type { AdminFraudQueryDto, AdminListQueryDto, AdminReportsQueryDto, AdminRestaurantsQueryDto, AdminTransactionsQueryDto, AdminUsersQueryDto, CreateAbuseReportDto } from './dto/admin.dto';
export declare class AdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMe(userId: string): Promise<AdminProfileDto>;
    assertPermission(role: string | null, permission: AdminPermission): void;
    listUsers(query: AdminUsersQueryDto): Promise<AdminUsersResponseDto>;
    setUserBanned(adminId: string, adminRole: string | null, userId: string, banned: boolean, reason?: string): Promise<AdminUserDto>;
    setUserVerified(adminId: string, userId: string, verified: boolean): Promise<AdminUserDto>;
    listRestaurants(query: AdminRestaurantsQueryDto): Promise<AdminRestaurantsResponseDto>;
    updateRestaurantListing(adminId: string, restaurantId: string, input: {
        approvalStatus?: RestaurantApprovalStatus;
        isActive?: boolean;
    }): Promise<AdminRestaurantDto>;
    listTransactions(query: AdminTransactionsQueryDto): Promise<AdminTransactionsResponseDto>;
    listPayouts(query: AdminListQueryDto): Promise<AdminTransactionsResponseDto>;
    listCommissions(query: AdminListQueryDto): Promise<AdminCommissionsResponseDto>;
    updateCommissionStatus(adminId: string, commissionId: string, status: 'APPROVED' | 'PAID' | 'REJECTED'): Promise<AdminCommissionDto>;
    createAbuseReport(reporterId: string, dto: CreateAbuseReportDto): Promise<AdminAbuseReportDto>;
    listAbuseReports(query: AdminReportsQueryDto): Promise<AdminAbuseReportsResponseDto>;
    updateAbuseReport(adminId: string, reportId: string, status: AbuseReportStatus, resolutionNote?: string): Promise<AdminAbuseReportDto>;
    listFraudLogs(query: AdminFraudQueryDto): Promise<AdminFraudLogsResponseDto>;
    getAnalytics(): Promise<AdminAnalyticsDto>;
    recentAuditLogs(): Promise<AdminAuditLogDto[]>;
    private sumFees;
    private sumPremium;
    private sumAds;
    private audit;
    private page;
    private decimal;
    private toUserDto;
    private toTransactionDto;
    private toCommissionDto;
    private toAbuseReportDto;
    private toFraudDto;
}
