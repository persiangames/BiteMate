import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_OTP_KEY } from '../decorators/auth.decorators';
import type { JwtPayload } from '../../modules/auth/types/jwt-payload.type';

@Injectable()
export class OtpVerifiedGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireOtp = this.reflector.getAllAndOverride<boolean>(REQUIRE_OTP_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireOtp) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;

    if (!user?.otpVerified) {
      throw new ForbiddenException('Phone OTP verification required for full access');
    }

    return true;
  }
}
