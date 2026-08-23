import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { UserPresenceDto } from '@bitemate/shared';
import { RedisService } from '../redis/redis.service';

interface PresenceRecord {
  isOnline: string;
  lastSeen: string;
  connections: string;
}

@Injectable()
export class PresenceService {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  private key(userId: string): string {
    const prefix = this.configService.get<string>(
      'chat.presencePrefix',
      'bitemate:presence:',
    )!;
    return `${prefix}${userId}`;
  }

  async connect(userId: string): Promise<UserPresenceDto> {
    const client = this.redisService.getClient();
    const now = new Date().toISOString();
    const connections = await client.hincrby(this.key(userId), 'connections', 1);
    await client.hset(this.key(userId), {
      isOnline: '1',
      lastSeen: now,
      connections: connections.toString(),
    });
    return { userId, isOnline: true, lastSeen: now };
  }

  async disconnect(userId: string): Promise<UserPresenceDto> {
    const client = this.redisService.getClient();
    const now = new Date().toISOString();
    const connections = await client.hincrby(this.key(userId), 'connections', -1);
    const nextConnections = Math.max(0, connections);

    if (nextConnections <= 0) {
      await client.hset(this.key(userId), {
        isOnline: '0',
        lastSeen: now,
        connections: '0',
      });
      return { userId, isOnline: false, lastSeen: now };
    }

    await client.hset(this.key(userId), 'connections', nextConnections.toString());
    return { userId, isOnline: true, lastSeen: now };
  }

  async getPresence(userId: string): Promise<UserPresenceDto> {
    const client = this.redisService.getClient();
    const record = (await client.hgetall(this.key(userId))) as unknown as PresenceRecord;
    if (!record.isOnline) {
      return { userId, isOnline: false, lastSeen: null };
    }

    return {
      userId,
      isOnline: record.isOnline === '1',
      lastSeen: record.lastSeen ?? null,
    };
  }

  async getPresenceBatch(userIds: string[]): Promise<Map<string, UserPresenceDto>> {
    const results = new Map<string, UserPresenceDto>();
    await Promise.all(
      userIds.map(async (userId) => {
        results.set(userId, await this.getPresence(userId));
      }),
    );
    return results;
  }
}
