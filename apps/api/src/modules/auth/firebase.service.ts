import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export interface FirebaseUserInfo {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  provider: 'GOOGLE' | 'FACEBOOK';
  emailVerified: boolean;
}

@Injectable()
export class FirebaseService implements OnModuleInit {
  private initialized = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const projectId = this.configService.get<string>('firebase.projectId');
    const clientEmail = this.configService.get<string>('firebase.clientEmail');
    const privateKey = this.configService.get<string>('firebase.privateKey');

    if (!projectId || !clientEmail || !privateKey) {
      return;
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }

    this.initialized = true;
  }

  isConfigured(): boolean {
    return this.initialized;
  }

  async verifyIdToken(idToken: string): Promise<FirebaseUserInfo> {
    if (!this.initialized) {
      throw new Error('Firebase Admin is not configured');
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    const provider = decoded.firebase.sign_in_provider;

    let authProvider: 'GOOGLE' | 'FACEBOOK';
    if (provider === 'google.com') {
      authProvider = 'GOOGLE';
    } else if (provider === 'facebook.com') {
      authProvider = 'FACEBOOK';
    } else {
      throw new Error(`Unsupported Firebase provider: ${provider}`);
    }

    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      name: decoded.name ?? null,
      picture: decoded.picture ?? null,
      provider: authProvider,
      emailVerified: decoded.email_verified ?? false,
    };
  }
}
