import { ABUSE_REPORT_STATUSES, ABUSE_REPORT_TARGET_TYPES, RESTAURANT_APPROVAL_STATUSES } from '@bitemate/shared';
export declare class AdminListQueryDto {
    search?: string;
    page: number;
    limit: number;
}
export declare class AdminUsersQueryDto extends AdminListQueryDto {
    role?: string;
    isActive?: boolean;
}
export declare class AdminRestaurantsQueryDto extends AdminListQueryDto {
    approvalStatus?: (typeof RESTAURANT_APPROVAL_STATUSES)[number];
}
export declare class AdminTransactionsQueryDto extends AdminListQueryDto {
    type?: string;
    status?: string;
}
export declare class AdminReportsQueryDto extends AdminListQueryDto {
    status?: (typeof ABUSE_REPORT_STATUSES)[number];
}
export declare class AdminFraudQueryDto extends AdminListQueryDto {
    minRiskScore?: number;
}
export declare class BanUserDto {
    banned: boolean;
    reason?: string;
}
export declare class VerifyUserDto {
    verified: boolean;
}
export declare class UpdateRestaurantListingDto {
    approvalStatus?: (typeof RESTAURANT_APPROVAL_STATUSES)[number];
    isActive?: boolean;
}
export declare class UpdateAbuseReportDto {
    status: (typeof ABUSE_REPORT_STATUSES)[number];
    resolutionNote?: string;
}
export declare class CreateAbuseReportDto {
    targetType: (typeof ABUSE_REPORT_TARGET_TYPES)[number];
    targetId: string;
    reason: string;
    details?: string;
}
export declare class UpdateCommissionStatusDto {
    status: 'APPROVED' | 'PAID' | 'REJECTED';
}
