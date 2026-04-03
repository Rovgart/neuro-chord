import { JwtPayload } from '@auth/interfaces/jwt-payload.interface';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '@redis/redis.service';
import * as bcrypt from 'bcrypt';
import { Logger } from 'nestjs-pino';
import { getNow } from 'src/utils';
import { GenerateTokensResult } from './interfaces/security.interfaces';

interface SecurityServiceI {
  hashPassword(password: string): Promise<string>;
  comparePasswords(password: string, hash: string): Promise<boolean>;
  generateTokens(payload: JwtPayload): Promise<GenerateTokensResult>;
}
@Injectable()
export class SecurityService implements SecurityServiceI {
  constructor(
    private configService: ConfigService,
    private logger: Logger,
    private jwtServ: JwtService,
    private redisService: RedisService,
  ) {}
  public async hashPassword(password: string): Promise<string> {
    try {
      const SALT_ROUNDS = this.configService.get('SALT_ROUNDS');
      const salt = await bcrypt.genSalt(Number(SALT_ROUNDS));
      return await bcrypt.hash(password, salt);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  public async comparePasswords(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
  public async generateTokens(payload: JwtPayload): Promise<GenerateTokensResult> {
    const accessSecret = this.configService.get('JWT_SECRET');
    const refreshSecret = this.configService.get('JWT_REFRESH_SECRET');
    const accessTokenPayload = {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      isVerified: payload.isVerified,
      sid: payload.sid,
    };
    const refreshTokenPayload = {
      sub: payload.sub,
      sid: payload.sid,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtServ.signAsync(accessTokenPayload, { secret: accessSecret, expiresIn: '15m' }),
      this.jwtServ.signAsync(refreshTokenPayload, { secret: refreshSecret, expiresIn: '7d' }),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }
  async refreshTokens(refreshToken: string) {
    const payload = await this.verifyToken('REFRESH', refreshToken);
    if (!payload) {
      throw new UnauthorizedException('Failed to verify token');
    }
    const isBlacklisted = await this.redisService.getBlacklistedRefreshToken(refreshToken);
    if (isBlacklisted) {
      throw new UnauthorizedException('Refresh token is blacklisted');
    }
    if (!payload.exp) {
      throw new UnauthorizedException('Invalid token structure');
    }
    const remainingTime = payload.exp - Math.floor(Date.now() / 1000);
    if (remainingTime > 0) {
      await this.redisService.setWithExpiry(`bl_ref:${refreshToken}`, 'true', remainingTime);
    }
    const tokens = await this.generateTokens({
      sub: payload.sub,
      email: payload.email,
      isVerified: payload.isVerified,
      role: payload.role,
      sid: payload.sid,
    });
    return tokens;
  }

  public async verifyToken(type: 'ACCESS' | 'REFRESH', token: string): Promise<JwtPayload> {
    if (!token) {
      throw new BadRequestException('Token is missing');
    }
    const secret =
      type === 'ACCESS' ? this.configService.get('JWT_SECRET') : this.configService.get('JWT_REFRESH_SECRET');

    return await this.jwtServ.verifyAsync<JwtPayload>(token, { secret });
  }
  public async verifyRoleClaim(token: string) {
    const verifiedToken = await this.verifyToken('ACCESS', token);
    return verifiedToken.role;
  }
  public validateTokensExpiration(token: JwtPayload) {
    if (!token.exp) {
      throw new UnauthorizedException("Token wasn't provided");
    }
    const now = getNow();
    if (token?.exp < now) {
      throw new UnauthorizedException('Token already expired');
    }
    return token;
  }
  public async validateVerificationExpiration(expirationDate: number) {
    // Verify expiration limit
    const now = Math.floor(Date.now() / 1000);
    if (expirationDate < now) {
      throw new UnauthorizedException('Verification token already expired');
    }
    return true;
  }
}
