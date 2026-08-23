import type { AdminAbuseReportDto, AdminAbuseReportsResponseDto, AdminAnalyticsDto, AdminAuditLogDto, AdminCommissionDto, AdminCommissionsResponseDto, AdminFraudLogsResponseDto, AdminProfileDto, AdminRestaurantsResponseDto, AdminRestaurantDto, AdminTransactionsResponseDto, AdminUserDto, AdminUsersResponseDto } from '@bitemate/shared';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { AdminService } from './admin.service';
import { AdminFraudQueryDto, AdminListQueryDto, AdminReportsQueryDto, AdminRestaurantsQueryDto, AdminTransactionsQueryDto, AdminUsersQueryDto, BanUserDto, UpdateAbuseReportDto, UpdateCommissionStatusDto, UpdateRestaurantListingDto, VerifyUserDto } from './dto/admin.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getMe(user: JwtPayload): Promise<AdminProfileDto>;
    getAnalytics(user: JwtPayload): Promise<AdminAnalyticsDto>;
    getAudit(user: JwtPayload): Promise<AdminAuditLogDto[]>;
    listUsers(user: JwtPayload, query: AdminUsersQueryDto): Promise<AdminUsersResponseDto>;
    banUser(user: JwtPayload, userId: string, dto: BanUserDto): Promise<AdminUserDto>;
    verifyUser(user: JwtPayload, userId: string, dto: VerifyUserDto): Promise<AdminUserDto>;
    listRestaurants(user: JwtPayload, query: AdminRestaurantsQueryDto): Promise<AdminRestaurantsResponseDto>;
    updateRestaurant(user: JwtPayload, restaurantId: string, dto: UpdateRestaurantListingDto): Promise<AdminRestaurantDto>;
    listTransactions(user: JwtPayload, query: AdminTransactionsQueryDto): Promise<AdminTransactionsResponseDto>;
    listPayouts(user: JwtPayload, query: AdminListQueryDto): Promise<AdminTransactionsResponseDto>;
    listCommissions(user: JwtPayload, query: AdminListQueryDto): Promise<AdminCommissionsResponseDto>;
    updateCommission(user: JwtPayload, commissionId: string, dto: UpdateCommissionStatusDto): Promise<AdminCommissionDto>;
    listReports(user: JwtPayload, query: AdminReportsQueryDto): Promise<AdminAbuseReportsResponseDto>;
    updateReport(user: JwtPayload, reportId: string, dto: UpdateAbuseReportDto): Promise<AdminAbuseReportDto>;
    listFraud(user: JwtPayload, query: AdminFraudQueryDto): Promise<AdminFraudLogsResponseDto>;
}
