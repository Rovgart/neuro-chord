import { LoginUserDto } from '@DTOs/login-user-dto';
import { RegisterUserDto } from '@DTOs/register-user.dto';
import { MailerCustomService } from '@mailer/mailer.service';
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { RedisService } from '@redis/redis.service';
import { SecurityService } from '@security/security.service';
import { SessionService } from '@session/session.service';
import { UsersService } from '@users/users.service';
import { PinoLogger } from 'nestjs-pino';
import { VerificationService } from 'src/common/infrastructure/verifications/verifications.service';
import { generateResetPin, getNow } from 'src/utils';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly mailer: MailerCustomService,
    private readonly securityService: SecurityService,
    private readonly sessionService: SessionService,
    private redisService: RedisService,
    private readonly userService: UsersService,
    private readonly verificationService: VerificationService,
    private logger: PinoLogger,
  ) {
    const check = this.configService.get('SALT_ROUNDS');
    const front_url = this.configService.get('FRONTEND_URL');
  }

  public async registerUser(userData: RegisterUserDto) {
    await this.userService.verifyUser(userData.email);
    const hashed = await this.securityService.hashPassword(userData.password);
    const result = await this.prisma.$transaction(async (tx) => {
      const tempUser = await this.userService.createTempUser(userData.email, hashed, tx);
      const verificationToken = await this.verificationService.createToken(tempUser.id, tx);
      return { tempUser, verificationToken };
    });
    await this.mailer.sendVerificationEmail(result?.tempUser, result?.verificationToken.token);
    return { message: 'Verification link sent to your email' };
  }
  public async authenticateUser(verifiedUser: any, deviceInfo: { ip: string; ua: string }) {
    try {
      const trans = await this.prisma.$transaction(async (tx) => {
        const updatedUser = await this.userService.updateStudent(verifiedUser.userId, { isVerified: true }, tx);
        if (!updatedUser) {
          throw new Error('Failed to update student');
        }
        const session = await this.sessionService.createSession(verifiedUser.userId, deviceInfo, tx);
        const tokens = await this.securityService.generateTokens({
          sub: updatedUser.id,
          email: updatedUser?.email,
          role: Role.STUDENT,
          isVerified: false,
          sid: session.id,
        });
        await this.verificationService.deleteVerifiedUser(verifiedUser.id, tx);
        return tokens;
      });
      return trans;
    } catch (error) {
      console.error(error);
    }
  }
  async refreshTokens(refreshToken: JwtPayload) {
    // Veryfy if sid exists in db, just compare
    const session = await this.sessionService.getSession(refreshToken.sid);
    if (!session) {
      throw new UnauthorizedException("Session doesn't exist for that user");
    }
    // Retrieve current user from db
    const user = await this.userService.findById(refreshToken.sub);
    if (!user || !user.isVerified) {
      throw new UnauthorizedException('User no longer active or verified');
    }
    const newPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      sid: session.id,
      role: user.role,
      isVerified: user.isVerified,
    };

    // Create new pair of accessToken and refreshToken
    const newTokens = await this.securityService.generateTokens(newPayload);
    await this.sessionService.updateSession(session.id, { refreshToken: newTokens.refreshToken });

    const now = getNow();
    const remainingTime = Number(refreshToken.exp) - now;
    if (remainingTime > 0) {
      await this.redisService.setWithExpiry(`bl_ref:${refreshToken.sid}`, 'true', remainingTime);
    }
    return newTokens;
  }
  async loginUser(userData: LoginUserDto, devInfo: { ip: string; ua: string }) {
    if (!userData.email || !userData.password) {
      throw new UnauthorizedException('Email and password are required');
    }

    const user = await this.userService.findByEmail(userData.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const storedPassword = user.password;
    if (!storedPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await this.securityService.comparePasswords(userData.password, storedPassword);

    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    return await this.prisma.$transaction(async (tx) => {
      const session = await this.sessionService.createSession(user.id, devInfo, tx);
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
        sid: session.id,
      };
      const { refreshToken, accessToken } = await this.securityService.generateTokens(payload);
      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          isVerified: user.isVerified,
          role: user.role,
        },
      };
    });
  }
  async initRecoverPassword(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException("User with this email doesn't exist");
    }
    const pin = generateResetPin();

    await this.redisService.setWithExpiry(`password-reset_pin:${email}`, pin, 15 * 60);
    await this.mailer.sendPasswordResetEmail(user, pin);
    return pin;
  }
  async checkEmailAvailability(email: string) {
    const user = this.userService.findByEmail(email);
    return { isAvailable: !user };
  }
  async generateResetPasswordToken(email: string) {
    if (!email) {
      throw new BadRequestException('No token or email provided');
    }
    return await this.securityService.generateResetPermissionToken(email);
  }
  async resetPassword(newPassword: string, resetToken: string) {
    const verified = await this.securityService.verifyToken('RESET', resetToken);
    if (!verified) {
      throw new UnauthorizedException('Verify reset token invalid or expired');
    }
    const user = await this.userService.findByEmail(verified.email, false);
    if (!user) {
      throw new NotFoundException("User with this email doesn't exist");
    }
    const hashed = await this.securityService.hashPassword(newPassword);

    await this.prisma.$transaction(async (tx) => {
      await this.userService.updateStudent(user.id, { password: hashed }, tx);
      await this.sessionService.revokeAllUsersActiveSessions(user.id);
    });
    await this.redisService.del(`password-reset:${verified.email}`);
  }
  async fullLogout(user: JwtPayload, token: string) {
    // I need some kind of decorator and guard before that happen
    await this.sessionService.deleteSession(user.sub, user.sid);
    await this.redisService.setWithExpiry(`bl_acc:${token}`, 'true', 15 * 60);
  }
  public async verifyEmail(token: string, devInfo: { ip: string; ua: string }) {
    return await this.prisma.$transaction(async (tx) => {
      const userToVerify = await this.verificationService.findToken(token);
      await this.verificationService.verifyToken(token);
      const user = await this.userService.updateStudent(userToVerify.userId, { isVerified: false, role: Role.STUDENT });
      if (!user.password) {
        throw new UnauthorizedException('Lack of password');
      }
      const session = await this.sessionService.createSession(user.id, devInfo, tx);
      const existingUser = await this.userService.findByEmail(user.email);
      if (existingUser) throw new BadRequestException('User with this email address already exists');

      const newUser = await this.userService.createStudent(user.email, user?.password, tx);
      const payload: JwtPayload = {
        sub: newUser.id,
        email: newUser.email,
        isVerified: newUser.isVerified,
        role: newUser.role,
        sid: session.id,
      };
      await this.sessionService.createSession(newUser.id, devInfo);
      const tokens = await this.securityService.generateTokens(payload);
      return tokens;
    });
  }
}
