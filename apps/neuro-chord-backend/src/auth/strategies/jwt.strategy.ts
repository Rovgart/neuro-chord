import { UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RedisService } from 'src/redis/redis.service';

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  // Checks blacklist in Redis before validating the token
  constructor(private readonly redisService: RedisService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || '',
      passReqToCallback: true,
    });
  }
  async validate(req: any, payload: any) {
    const token = req.headers.authorization?.split(' ')[1];
    const isBlacklisted = await this.redisService.get(`bl:${token}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('This token is blacklisted');
    }
    return { userId: payload.sub, email: payload.email };
  }
}
