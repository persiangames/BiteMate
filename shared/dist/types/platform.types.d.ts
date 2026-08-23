export declare const USER_ROLES: readonly ["NORMAL_USER", "RESTAURANT_OWNER", "CAFE_OWNER", "FOOD_TRUCK_OWNER", "HOME_CHEF", "FOOD_REVIEWER", "COMPANION_USER", "INFLUENCER"];
export declare const ADMIN_ROLES: readonly ["PLATFORM_ADMIN", "MODERATOR"];
export declare const ALL_USER_ROLES: readonly ["NORMAL_USER", "RESTAURANT_OWNER", "CAFE_OWNER", "FOOD_TRUCK_OWNER", "HOME_CHEF", "FOOD_REVIEWER", "COMPANION_USER", "INFLUENCER", "PLATFORM_ADMIN", "MODERATOR"];
export type PublicUserRole = (typeof USER_ROLES)[number];
export type AdminRole = (typeof ADMIN_ROLES)[number];
export type UserRole = (typeof ALL_USER_ROLES)[number];
export declare function isAdminRole(role: string | null | undefined): role is AdminRole;
export declare const AUTH_PROVIDERS: readonly ["EMAIL", "GOOGLE", "FACEBOOK", "PHONE"];
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];
export declare const SUPPORTED_LOCALES: readonly ["en", "fa", "ar", "hi", "tr", "fr", "it", "zh", "ja", "es", "de", "ru", "pt", "ko", "id", "th", "vi", "nl"];
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export declare const LOCALE_LABELS: Record<SupportedLocale, string>;
export declare const USER_ROLE_LABELS: Record<UserRole, string>;
//# sourceMappingURL=platform.types.d.ts.map