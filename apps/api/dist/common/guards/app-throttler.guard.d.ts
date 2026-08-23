import { ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
export declare class AppThrottlerGuard extends ThrottlerGuard {
    protected shouldSkip(context: ExecutionContext): Promise<boolean>;
    protected getTracker(req: Request): Promise<string>;
    private clientIp;
}
