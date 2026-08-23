import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export interface FirebaseUserInfo {
    uid: string;
    email: string | null;
    name: string | null;
    picture: string | null;
    provider: 'GOOGLE' | 'FACEBOOK';
    emailVerified: boolean;
}
export declare class FirebaseService implements OnModuleInit {
    private readonly configService;
    private initialized;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    isConfigured(): boolean;
    verifyIdToken(idToken: string): Promise<FirebaseUserInfo>;
}
