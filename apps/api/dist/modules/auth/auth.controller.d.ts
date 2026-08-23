import type { Request } from 'express';
import type { AuthResponseDto, OtpRequestResponseDto } from '@bitemate/shared';
import { AuthService } from './auth.service';
import { FirebaseAuthDto, LoginDto, RefreshTokenDto, RegisterDto, RequestOtpDto, VerifyOtpDto, VerifyTwoFactorDto } from './dto/auth.dto';
import type { JwtPayload } from './types/jwt-payload.type';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto, req: Request): Promise<AuthResponseDto>;
    login(dto: LoginDto, req: Request): Promise<AuthResponseDto>;
    firebaseAuth(dto: FirebaseAuthDto): Promise<AuthResponseDto>;
    refresh(dto: RefreshTokenDto): Promise<AuthResponseDto>;
    logout(dto: RefreshTokenDto): Promise<{
        message: string;
    }>;
    logoutAll(user: JwtPayload): Promise<{
        message: string;
    }>;
    requestOtp(user: JwtPayload, dto: RequestOtpDto): Promise<OtpRequestResponseDto>;
    verifyOtp(user: JwtPayload, dto: VerifyOtpDto): Promise<AuthResponseDto>;
    verifyTwoFactor(dto: VerifyTwoFactorDto): Promise<AuthResponseDto>;
}
