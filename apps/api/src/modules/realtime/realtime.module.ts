import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ChatModule } from '../chat/chat.module';
import { RedisModule } from '../redis/redis.module';
import { RealtimeGateway } from './realtime.gateway';
import { PresenceService } from '../chat/presence.service';

const skipMongo = process.env.SKIP_MONGO === 'true';

@Module({
  imports: [
    AuthModule,
    RedisModule,
    ...(skipMongo ? [] : [forwardRef(() => ChatModule)]),
  ],
  providers: [RealtimeGateway, PresenceService],
  exports: [RealtimeGateway, PresenceService],
})
export class RealtimeModule {}
