import { ConfigService } from '@nestjs/config';
import { FirebaseService } from '../auth/firebase.service';
export declare class FcmService {
    private readonly firebaseService;
    private readonly configService;
    private readonly logger;
    constructor(firebaseService: FirebaseService, configService: ConfigService);
    isConfigured(): boolean;
    sendToTokens(params: {
        tokens: string[];
        title: string;
        body: string;
        data?: Record<string, string>;
    }): Promise<{
        successCount: number;
        failureCount: number;
    }>;
}
