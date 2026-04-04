import { JwtPayload } from '@auth/interfaces/jwt-payload.interface';
import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { getNow } from 'src/utils';
import { GenerateTokensResult } from './interfaces/security.interfaces';

interface SecurityServiceI {
  hashPassword(password: string): Promise<string>;
  comparePasswords(password: string, hash: string): Promise<boolean>;
  generateTokens(payload: JwtPayload): Promise<GenerateTokensResult>;
}
enum CookieSecrets {
  REFRESH = 'JWT_REFRESH_SECRET',
  ACCESS = 'JWT_SECRET',
  RESET = 'JWT_PASSWORD_RESET_SECRET',
}
@Injectable()
export class SecurityService implements SecurityServiceI {
  constructor(
    private configService: ConfigService,

    private jwtServ: JwtService,
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
      this.jwtServ.signAsync(accessTokenPayload, {
        secret: accessSecret,
        expiresIn: '15m',
      }),
      this.jwtServ.signAsync(refreshTokenPayload, {
        secret: refreshSecret,
        expiresIn: '7d',
      }),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }
  public async generateResetPermissionToken(email: string) {
    const payload = {
      email,
      action: 'password_reset_final',
      sub: 'temporary_permission',
    };
    return this.jwtServ.sign(payload, {
      secret: this.configService.get('JWT_PASSWORD_RESET_SECRET'),
      expiresIn: '10m',
    });
  }

  public async verifyToken(type: keyof typeof CookieSecrets, token: string): Promise<JwtPayload> {
    if (!token) {
      throw new BadRequestException('Token is missing');
    }
    const configKey = CookieSecrets[type];
    const secret = this.configService.get(configKey);
    if (!secret) {
      throw new InternalServerErrorException(`Secret for ${configKey} is not defined`);
    }
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
    const remainingTime = token.exp - now;
    if (remainingTime <= 0) {
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
