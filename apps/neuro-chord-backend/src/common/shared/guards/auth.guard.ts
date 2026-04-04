/** biome-ignore-all lint/style/useImportType: <explanation> */

import { IS_PUBLIC_KEY } from "@decorators/public.decorator";
import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SecurityService } from "@security/security.service";
import type { Request } from "express";
import { RedisService } from "src/common/infrastructure/redis/redis.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private redisService: RedisService,
    private reflector: Reflector,
    private securityService: SecurityService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    if (request.url === "/metrics") {
      return true;
    }
    console.log("--- AUTH HEADER ---", request.headers["authorization"]);
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException("No token provided");
    }

    const isBlacklisted = await this.redisService.getBlacklistedAccessToken(
      `bl_acc:${token}`,
    );
    if (isBlacklisted) {
      throw new UnauthorizedException("Token has been blacklisted");
    }
    const verifiedToken = await this.securityService.verifyToken(
      "ACCESS",
      token,
    );
    if (!verifiedToken) {
      throw new UnauthorizedException("Invalid  token");
    }
    const validateToken =
      await this.securityService.validateTokensExpiration(verifiedToken);
    const ip =
      request.ip ||
      request.headers["x-forwarded-for"] ||
      request.socket.remoteAddress;
    const userAgent = request.headers["user-agent"] || "unknown";
    request.user = validateToken;
    request.metadata = {
      ip,
      userAgent,
    };
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    console.log(token);
    return type === "Bearer" ? token : undefined;
  }
}
