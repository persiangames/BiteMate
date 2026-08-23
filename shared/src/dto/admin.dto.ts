import type { UserRole } from '../types/platform.types';
import type { WalletTransactionStatus, WalletTransactionType } from './wallet.dto';

export const RESTAURANT_APPROVAL_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;
export type RestaurantApprovalStatus = (typeof RESTAURANT_APPROVAL_STATUSES)[number];

export const ABUSE_REPORT_STATUSES = ['OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED'] as const;
export type AbuseReportStatus = (typeof ABUSE_REPORT_STATUSES)[number];

export const ABUSE_REPORT_TARGET_TYPES = ['USER', 'RESTAURANT', 'POST', 'MEETUP'] as const;
export type AbuseReportTargetType = (typeof ABUSE_REPORT_TARGET_TYPES)[number];

export type AdminPermission =
  | 'users'
  | 'restaurants'
  | 'finance'
  | 'reports'
  | 'analytics';

export const ADMIN_ROLE_PERMISSIONS: Record<'PLATFORM_ADMIN' | 'MODERATOR', AdminPermission[]> = {
  PLATFORM_ADMIN: ['users', 'restaurants', 'finance', 'reports', 'analytics'],
  MODERATOR: ['users', 'restaurants', 'reports', 'analytics'],
};

export interface AdminProfileDto {
  id: string;
  email: string | null;
  fullName: string | null;
  role: UserRole;
  permissions: AdminPermission[];
}

export interface AdminUserDto {
  id: string;
  email: string | null;
  phoneNumber: string | null;
  fullName: string | null;
  username: string | null;
  role: UserRole | null;
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
  createdAt: string;
}

export interface AdminUsersResponseDto {
  items: AdminUserDto[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminRestaurantDto {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string | null;
  ownerEmail: string | null;
  city: string | null;
  country: string | null;
  cuisineTypes: string[];
  averageRating: number;
  reviewCount: number;
  isActive: boolean;
  approvalStatus: RestaurantApprovalStatus;
  isSponsored: boolean;
  createdAt: string;
}

export interface AdminRestaurantsResponseDto {
  items: AdminRestaurantDto[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminTransactionDto {
  id: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  description: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface AdminTransactionsResponseDto {
  items: AdminTransactionDto[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminCommissionDto {
  id: string;
  referrerUserId: string;
  referrerEmail: string | null;
  referrerName: string | null;
  sourceType: string;
  sourceId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface AdminCommissionsResponseDto {
  items: AdminCommissionDto[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminAbuseReportDto {
  id: string;
  reporterId: string;
  reporterEmail: string | null;
  reporterName: string | null;
  targetType: AbuseReportTargetType;
  targetId: string;
  reason: string;
  details: string | null;
  status: AbuseReportStatus;
  reviewedById: string | null;
  resolutionNote: string | null;
  createdAt: string;
}

export interface AdminAbuseReportsResponseDto {
  items: AdminAbuseReportDto[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateAbuseReportRequestDto {
  targetType: AbuseReportTargetType;
  targetId: string;
  reason: string;
  details?: string;
}

export interface AdminFraudLogDto {
  id: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  action: string;
  ipAddress: string | null;
  riskScore: number;
  details: Record<string, unknown> | null;
  createdAt: string;
}

export interface AdminFraudLogsResponseDto {
  items: AdminFraudLogDto[];
  total: number;
  highRiskCount: number;
  page: number;
  limit: number;
}

export interface AdminAnalyticsDto {
  generatedAt: string;
  users: {
    total: number;
    activeToday: number;
    newToday: number;
    premium: number;
    banned: number;
  };
  meetups: {
    total: number;
    open: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    createdToday: number;
  };
  restaurants: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  revenue: {
    currency: string;
    today: number;
    last7Days: number;
    last30Days: number;
    fees: number;
    premium: number;
    ads: number;
    pendingPayouts: number;
  };
  reports: {
    openAbuse: number;
    highRiskFraud: number;
  };
}

export interface AdminAuditLogDto {
  id: string;
  adminId: string;
  adminEmail: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  createdAt: string;
}
