export interface JwtPayload {
    sub: string;
    email: string | null;
    role: string | null;
    otpVerified: boolean;
    tv?: number;
    jti?: string;
    iss?: string;
    aud?: string;
}
