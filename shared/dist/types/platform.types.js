"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_ROLE_LABELS = exports.LOCALE_LABELS = exports.SUPPORTED_LOCALES = exports.AUTH_PROVIDERS = exports.ALL_USER_ROLES = exports.ADMIN_ROLES = exports.USER_ROLES = void 0;
exports.isAdminRole = isAdminRole;
exports.USER_ROLES = [
    'NORMAL_USER',
    'RESTAURANT_OWNER',
    'CAFE_OWNER',
    'FOOD_TRUCK_OWNER',
    'HOME_CHEF',
    'FOOD_REVIEWER',
    'COMPANION_USER',
    'INFLUENCER',
];
exports.ADMIN_ROLES = ['PLATFORM_ADMIN', 'MODERATOR'];
exports.ALL_USER_ROLES = [...exports.USER_ROLES, ...exports.ADMIN_ROLES];
function isAdminRole(role) {
    return role === 'PLATFORM_ADMIN' || role === 'MODERATOR';
}
exports.AUTH_PROVIDERS = [
    'EMAIL',
    'GOOGLE',
    'FACEBOOK',
    'PHONE',
];
exports.SUPPORTED_LOCALES = [
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
];
exports.LOCALE_LABELS = {
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
exports.USER_ROLE_LABELS = {
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
//# sourceMappingURL=platform.types.js.map