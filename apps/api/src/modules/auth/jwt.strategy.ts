import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import type { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') ?? 'dev-only-jwt-secret-change-me',
      issuer: configService.get<string>('jwt.issuer', 'bitemate'),
      audience: configService.get<string>('jwt.audience', 'bitemate-app'),
    });
  }

  async validate(payload: JwtPayload & { purpose?: string }): Promise<JwtPayload> {
    if (!payload?.sub || !payload.jti || payload.purpose === '2fa') {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        isActive: true,
        role: true,
        otpVerified: true,
        email: true,
        tokenVersion: true,
      },
    });

    if (!user?.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    if ((payload.tv ?? 0) !== user.tokenVersion) {
      throw new UnauthorizedException('Token has been revoked');
    }

    return {
      sub: payload.sub,
      email: user.email,
      role: user.role,
      otpVerified: user.otpVerified,
      tv: user.tokenVersion,
      jti: payload.jti,
    };
  }
}
