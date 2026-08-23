"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADMIN_ROLE_PERMISSIONS = exports.ABUSE_REPORT_TARGET_TYPES = exports.ABUSE_REPORT_STATUSES = exports.RESTAURANT_APPROVAL_STATUSES = void 0;
exports.RESTAURANT_APPROVAL_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];
exports.ABUSE_REPORT_STATUSES = ['OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED'];
exports.ABUSE_REPORT_TARGET_TYPES = ['USER', 'RESTAURANT', 'POST', 'MEETUP'];
exports.ADMIN_ROLE_PERMISSIONS = {
    PLATFORM_ADMIN: ['users', 'restaurants', 'finance', 'reports', 'analytics'],
    MODERATOR: ['users', 'restaurants', 'reports', 'analytics'],
};
//# sourceMappingURL=admin.dto.js.map