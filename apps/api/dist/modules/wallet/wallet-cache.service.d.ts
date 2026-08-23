import { ConfigService } from '@nestjs/config';
import type { WalletBalanceResponseDto, WalletTransactionDto } from '@bitemate/shared';
import { RedisService } from '../redis/redis.service';
export declare class WalletCacheService {
    private readonly redisService;
    private readonly configService;
    constructor(redisService: RedisService, configService: ConfigService);
    private balanceKey;
    private txKey;
    private ttl;
    getBalance(userId: string): Promise<WalletBalanceResponseDto | null>;
    setBalance(userId: string, balance: WalletBalanceResponseDto): Promise<void>;
    invalidateBalance(userId: string): Promise<void>;
    prependTransactions(userId: string, items: WalletTransactionDto[]): Promise<void>;
    invalidateTransactions(userId: string): Promise<void>;
    invalidateUser(userId: string): Promise<void>;
}
