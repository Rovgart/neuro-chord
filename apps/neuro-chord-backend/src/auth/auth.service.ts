import { LoginUserDto } from '@DTOs/login-user-dto';
import { RegisterUserDto } from '@DTOs/register-user.dto';
import { MailerCustomService } from '@mailer/mailer.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { RedisService } from '@redis/redis.service';
import { SecurityService } from '@security/security.service';
import { SessionService } from '@session/session.service';
import { UsersService } from '@users/users.service';
import { nanoid } from 'nanoid';
import { PinoLogger } from 'nestjs-pino';
import { VerificationService } from 'src/common/infrastructure/verifications/verifications.service';
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
    console.log('--- TEST CONFIG SERVICE ---', {
      val: check,
      type: typeof check,
      all: this.configService.get('POSTGRES_DB_URL') ? 'OK' : 'MISSING',
      front: front_url,
    });
  }

  public async registerUser(userData: RegisterUserDto) {
    await this.userService.verifyUser(userData.email);
    const result = await this.prisma.$transaction(async (tx) => {
      const tempUser = await this.userService.createTempUser(userData.email, userData.password, tx);
      const verificationToken = await this.verificationService.createToken(tempUser.id, tx);
      return { tempUser, verificationToken };
    });
    await this.mailer.sendVerificationEmail(result?.tempUser, result?.verificationToken.token);
    return { message: 'Verification link sent to your email' };
  }
  public async authenticateUser(token: string, deviceInfo: { ip: string; ua: string }) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    return await this.prisma.$transaction(async (tx) => {
      const userToVerify = await this.verificationService.findToken(token, tx);
      if (!userToVerify) {
        throw new BadRequestException('Invalid or expired email verification token');
      }
      const updatedUser = await this.userService.updateStudent(userToVerify.id, { isVerified: true }, tx);
      if (!updatedUser) {
        throw new Error('Failed to update student');
      }
      const session = await this.sessionService.createSession(userToVerify.userId, deviceInfo, tx);
      const tokens = await this.securityService.generateTokens({
        sub: updatedUser.id,
        email: updatedUser?.email,
        role: Role.STUDENT,
        isVerified: false,
        sid: session.id,
      });
      await this.verificationService.deleteToken(token);
      return tokens;
    });
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
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      if (!user) {
        throw new NotFoundException("User with this email doesn't exist");
      }
      const payload = { id: user.id, email: user.email };
      const uniqueToken = nanoid();

      await this.redisService.setWithExpiry(`password-reset:${uniqueToken}`, payload.id, 15 * 60);
      return uniqueToken;
    } catch (error) {
      this.logger.error('Failed to init recover password process', error);
      throw new InternalServerErrorException('Failed to init recover password process', error);
    }
  }
  async checkEmailAvailability(email: string) {
    const user = this.userService.findByEmail(email);
    return { isAvailable: !user };
  }
  async resetPassword(token: string, password: string) {
    const hashed = await this.securityService.hashPassword(password);
    const userId = await this.redisService.getPasswordReset(`password-reset:${token}`);
    if (!userId) {
      throw new BadRequestException('Invalid or expired password reset token');
    }
    await this.userService.updateStudent(userId, { password: hashed });
    await this.redisService.del(`password-reset:${token}`);
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
