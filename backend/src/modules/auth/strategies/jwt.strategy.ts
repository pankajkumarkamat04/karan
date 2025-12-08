import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import appConfig from '../../../config/app.config';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // ignoreExpiration: false,
      ignoreExpiration: true,
      secretOrKey: appConfig().jwt.secret,
    });
  }

  async validate(payload: any) {
    // Check if user is banned
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { is_banned: true, ban_reason: true },
    });

    if (user?.is_banned) {
      throw new UnauthorizedException({
        message: 'Your account has been banned',
        reason: user.ban_reason || 'Violation of terms of service',
        contact_email: process.env.CONTACT_EMAIL || 'support@example.com',
        contact_phone: process.env.CONTACT_PHONE || '+1-800-XXX-XXXX',
      });
    }

    return { userId: payload.sub, email: payload.email };
  }
}
