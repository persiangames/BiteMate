import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const REQUIRE_OTP_KEY = 'requireOtp';
export const RequireOtpVerified = () => SetMetadata(REQUIRE_OTP_KEY, true);
