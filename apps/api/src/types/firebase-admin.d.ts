declare module 'firebase-admin' {
  export interface DecodedIdToken {
    uid: string;
    email?: string;
    name?: string;
    picture?: string;
    email_verified?: boolean;
    firebase: {
      sign_in_provider: string;
    };
  }

  export interface App {
    name?: string;
  }

  export interface Auth {
    verifyIdToken(idToken: string): Promise<DecodedIdToken>;
  }

  export interface Messaging {
    send(message: {
      token: string;
      notification?: { title?: string; body?: string };
      data?: Record<string, string>;
    }): Promise<string>;
    sendEachForMulticast(message: {
      tokens: string[];
      notification?: { title?: string; body?: string };
      data?: Record<string, string>;
    }): Promise<{ successCount: number; failureCount: number }>;
  }

  export namespace auth {
    function verifyIdToken(idToken: string): Promise<DecodedIdToken>;
  }

  export namespace credential {
    function cert(config: {
      projectId: string;
      clientEmail: string;
      privateKey: string;
    }): unknown;
  }

  export namespace messaging {
    function send(message: {
      token: string;
      notification?: { title?: string; body?: string };
      data?: Record<string, string>;
    }): Promise<string>;
  }

  export function initializeApp(config: { credential: unknown }): App;
  export function auth(): Auth;
  export function messaging(): Messaging;

  const apps: App[];
}
