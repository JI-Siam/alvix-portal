import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(cfg: ConfigService) {
    super({
      jwtFromRequest: (req: any) => req?.cookies?.access_token ?? null, // HttpOnly cookie only
      secretOrKey: cfg.getOrThrow<string>('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }
  validate(payload: { sub: string; role: string }) {
    return { sub: payload.sub, role: payload.role }; // identity is always derived from the token
  }
}
