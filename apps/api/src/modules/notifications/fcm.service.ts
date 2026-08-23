import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { FirebaseService } from '../auth/firebase.service';

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly configService: ConfigService,
  ) {}

  isConfigured(): boolean {
    return this.firebaseService.isConfigured();
  }

  async sendToTokens(params: {
    tokens: string[];
    title: string;
    body: string;
    data?: Record<string, string>;
  }): Promise<{ successCount: number; failureCount: number }> {
    if (!this.isConfigured() || !params.tokens.length) {
      return { successCount: 0, failureCount: params.tokens.length };
    }

    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens: params.tokens,
        notification: {
          title: params.title,
          body: params.body,
        },
        data: params.data,
      });

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      this.logger.warn(`FCM multicast failed: ${error instanceof Error ? error.message : error}`);
      return { successCount: 0, failureCount: params.tokens.length };
    }
  }
}
