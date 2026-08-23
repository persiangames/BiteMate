import { ConfigService } from '@nestjs/config';
import type { UserPresenceDto } from '@bitemate/shared';
import { RedisService } from '../redis/redis.service';
export declare class PresenceService {
    private readonly redisService;
    private readonly configService;
    constructor(redisService: RedisService, configService: ConfigService);
    private key;
    connect(userId: string): Promise<UserPresenceDto>;
    disconnect(userId: string): Promise<UserPresenceDto>;
    getPresence(userId: string): Promise<UserPresenceDto>;
    getPresenceBatch(userIds: string[]): Promise<Map<string, UserPresenceDto>>;
}
