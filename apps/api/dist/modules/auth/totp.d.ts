export declare function generateTotpSecret(): string;
export declare function buildOtpAuthUrl(account: string, secret: string, issuer?: string): string;
export declare function verifyTotpCode(secret: string, code: string, window?: number): boolean;
