import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { WalletBalanceResponseDto, WalletTransactionDto } from '@bitemate/shared';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class WalletCacheService {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  private balanceKey(userId: string): string {
    return `bitemate:wallet:balance:${userId}`;
  }

  private txKey(userId: string): string {
    return `bitemate:wallet:tx:${userId}`;
  }

  private ttl(): number {
    return this.configService.get<number>('wallet.cacheTtlSeconds', 60)!;
  }

  async getBalance(userId: string): Promise<WalletBalanceResponseDto | null> {
    const raw = await this.redisService.getClient().get(this.balanceKey(userId));
    return raw ? (JSON.parse(raw) as WalletBalanceResponseDto) : null;
  }

  async setBalance(userId: string, balance: WalletBalanceResponseDto): Promise<void> {
    await this.redisService
      .getClient()
      .set(this.balanceKey(userId), JSON.stringify(balance), 'EX', this.ttl());
  }

  async invalidateBalance(userId: string): Promise<void> {
    await this.redisService.getClient().del(this.balanceKey(userId));
  }

  async prependTransactions(userId: string, items: WalletTransactionDto[]): Promise<void> {
    const client = this.redisService.getClient();
    const key = this.txKey(userId);
    const existing = await client.get(key);
    const merged = existing
      ? [...items, ...(JSON.parse(existing) as WalletTransactionDto[])].slice(0, 20)
      : items.slice(0, 20);
    await client.set(key, JSON.stringify(merged), 'EX', this.ttl());
  }

  async invalidateTransactions(userId: string): Promise<void> {
    await this.redisService.getClient().del(this.txKey(userId));
  }

  async invalidateUser(userId: string): Promise<void> {
    await this.invalidateBalance(userId);
    await this.invalidateTransactions(userId);
  }
}
