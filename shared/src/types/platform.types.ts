export const USER_ROLES = [
  'NORMAL_USER',
  'RESTAURANT_OWNER',
  'CAFE_OWNER',
  'FOOD_TRUCK_OWNER',
  'HOME_CHEF',
  'FOOD_REVIEWER',
  'COMPANION_USER',
  'INFLUENCER',
] as const;

export const ADMIN_ROLES = ['PLATFORM_ADMIN', 'MODERATOR'] as const;

export const ALL_USER_ROLES = [...USER_ROLES, ...ADMIN_ROLES] as const;

export type PublicUserRole = (typeof USER_ROLES)[number];
export type AdminRole = (typeof ADMIN_ROLES)[number];
export type UserRole = (typeof ALL_USER_ROLES)[number];

export function isAdminRole(role: string | null | undefined): role is AdminRole {
  return role === 'PLATFORM_ADMIN' || role === 'MODERATOR';
}

export const AUTH_PROVIDERS = [
  'EMAIL',
  'GOOGLE',
  'FACEBOOK',
  'PHONE',
] as const;

export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export const SUPPORTED_LOCALES = [
  'en',
  'fa',
  'ar',
  'hi',
  'tr',
  'fr',
  'it',
  'zh',
  'ja',
  'es',
  'de',
  'ru',
  'pt',
  'ko',
  'id',
  'th',
  'vi',
  'nl',
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: 'English',
  fa: 'Persian',
  ar: 'Arabic',
  hi: 'Hindi',
  tr: 'Turkish',
  fr: 'French',
  it: 'Italian',
  zh: 'Chinese',
  ja: 'Japanese',
  es: 'Spanish',
  de: 'German',
  ru: 'Russian',
  pt: 'Portuguese',
  ko: 'Korean',
  id: 'Indonesian',
  th: 'Thai',
  vi: 'Vietnamese',
  nl: 'Dutch',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  NORMAL_USER: 'Normal User',
  RESTAURANT_OWNER: 'Restaurant Owner',
  CAFE_OWNER: 'Cafe Owner',
  FOOD_TRUCK_OWNER: 'Food Truck Owner',
  HOME_CHEF: 'Home Chef',
  FOOD_REVIEWER: 'Food Reviewer / Tester',
  COMPANION_USER: 'Companion User',
  INFLUENCER: 'Influencer / Advertiser',
  PLATFORM_ADMIN: 'Platform Admin',
  MODERATOR: 'Moderator',
};
