/** biome-ignore-all lint/style/useImportType: <explanation> */
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { RedisService } from "src/common/infrastructure/redis/redis.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(private readonly redisService: RedisService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "",
      passReqToCallback: true,
    });
  }
  async validate(req: any, payload: any) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException("Missing authorization header");
    }
    const token = authHeader.split(" ")[1];
    const isBlacklisted = await this.redisService.getBlacklistedAccessToken(
      `bl:${token}`,
    );
    if (isBlacklisted) {
      throw new UnauthorizedException("This token is blacklisted");
    }
    return { userId: payload.sub, email: payload.email };
  }
}
