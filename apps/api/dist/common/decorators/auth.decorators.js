"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireOtpVerified = exports.REQUIRE_OTP_KEY = exports.Roles = exports.ROLES_KEY = exports.Public = exports.IS_PUBLIC_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.IS_PUBLIC_KEY = 'isPublic';
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
exports.REQUIRE_OTP_KEY = 'requireOtp';
const RequireOtpVerified = () => (0, common_1.SetMetadata)(exports.REQUIRE_OTP_KEY, true);
exports.RequireOtpVerified = RequireOtpVerified;
//# sourceMappingURL=auth.decorators.js.map