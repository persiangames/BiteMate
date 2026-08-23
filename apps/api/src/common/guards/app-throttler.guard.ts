import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
import type { JwtPayload } from '../../modules/auth/types/jwt-payload.type';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') {
      return true;
    }
    return super.shouldSkip(context);
  }

  protected async getTracker(req: Request): Promise<string> {
    const user = req.user as JwtPayload | undefined;
    if (user?.sub) {
      return `user:${user.sub}`;
    }
    return `ip:${this.clientIp(req)}`;
  }

  private clientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
      return forwarded.split(',')[0]!.trim();
    }
    return req.ip ?? req.socket.remoteAddress ?? 'unknown';
  }
}
