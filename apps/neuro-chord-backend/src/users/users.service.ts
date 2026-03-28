/** biome-ignore-all lint/style/useImportType: <explanation> */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { compare, genSalt, hash } from 'bcrypt';
// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import * as crypto from 'crypto'; // Importuj cały moduł
import { Logger } from 'nestjs-pino';
import { CreateProfileDto } from 'src/auth/dto/create-profile-dto';
import { LoginUserDto } from 'src/auth/dto/login-user-dto';
import type { RegisterUserDto } from 'src/auth/dto/register-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtServ: JwtService,
    private readonly redisService: RedisService,
    private readonly logger: Logger,
    private eventEmitter: EventEmitter2,
  ) {}
  async findAll() {
    return this.prisma.user.findMany();
  }
  async registerUser(
    userData: RegisterUserDto,
    devInfo: { ip: string | string[]; ua: string },
  ): Promise<{ id: string; email: string; message: string; accessToken: string; refreshToken: string }> {
    return await this.prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { email: userData.email },
      });
      if (existingUser) throw new ConflictException('User with this email address already exists');
      const salt = await genSalt();
      const hashed = await hash(userData.password, salt);
      const newUser = await this.prisma.user.create({
        data: {
          email: userData.email,
          password: hashed,
          role: 'STUDENT',
        },
      });
      const tokens = await this.generateTokens({ id: newUser.id, email: newUser.email });
      await tx.session.create({
        data: {
          userAgent: devInfo.ua,
          ipAddress: devInfo.ip as string,
          userId: newUser.id,
        },
      });
      // this.eventEmitter.emit('user.registered', {
      //   userId: newUser.id,
      //   email: newUser.email,
      // });
      return { id: newUser.id, email: newUser.email, message: 'User succesfully registered', ...tokens };
    });
  }
  async loginUser(userData: LoginUserDto, devInfo: { ip: string; ua: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });
    if (!user || !user.password) throw new UnauthorizedException('Wrong email or password');

    const isPasswordValid = await compare(userData.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Wrong email or password');
    const payload = { id: user.id, email: user.email };
    const { refreshToken, accessToken } = await this.generateTokens(payload);
    await this.prisma.session.create({
      data: {
        userId: user.id,
        ipAddress: devInfo.ip,
        userAgent: devInfo.ua,
      },
    });
    return {
      accessToken,
      refreshToken,
      user: {
        id: payload.id,
        email: payload.email,
      },
    };
  }
  async validateOAuthUser(googleUser: any) {
    let user = await this.prisma.user.findUnique({
      where: {
        email: googleUser.email,
      },
    });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          role: 'STUDENT',
        },
      });
    }
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: await this.jwtServ.signAsync(payload, {
        secret: process.env.JWT_SECRET,
      }),
    };
  }
  async createProfile(userId: string, profileData: CreateProfileDto) {
    return await this.prisma.$transaction(async (transact) => {
      const newProfile = await transact.profile.create({
        data: {
          userId: userId,
          username: profileData.username,
          displayName: profileData.username,
        },
      });
      await transact.user.update({
        where: { id: userId },
        data: {
          onboardingComplete: true,
        },
      });
      return newProfile;
    });
  }
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) {
      throw new NotFoundException("User doesn't exist");
    }
    const { password, ...rest } = user;
    return rest;
  }
  async fullLogout(accessToken: string) {
    try {
      const user = await this.jwtServ.decode(accessToken);
      await this.prisma.session.deleteMany({
        where: { userId: user.id },
      });
      await this.redisService.setWithExpiry(`bl_acc:${accessToken}`, 'true', 15 * 60);
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Failed to logout', err);
    }
  }
  async recoverPassword(email: string) {
    if (!email) {
      throw new NotFoundException('No email provided');
    }
    const user = await this.prisma?.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException("User with this email doesn't exists");
    }
    const expiresAt = new Date(Date.now() + 3600000);
    const token = crypto.randomBytes(32).toString('hex');
    await this.prisma?.passwordReset.upsert({
      where: { userId: user.id },
      update: {
        token,
        email: user.email,
        expiresAt,
      },
      create: {
        userId: user.id,
        email,
        token,
        expiresAt,
      },
    });
    return token;
  }
  async resetPassword(token: string, password: string) {
    const salt = await genSalt();
    const hashed = await hash(password, salt);
    const resetRecord = await this.prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!resetRecord || resetRecord.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('Token is invalid or expired');
    }
    return await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: resetRecord.userId,
        },
        data: {
          password: hashed,
        },
      });
      await tx.passwordReset.delete({
        where: { id: resetRecord.id },
      });
    });
  }
  async getUser(accessToken: string) {
    try {
      const payload = await this.jwtServ.decode(accessToken);
      const user = await this.prisma.user.findUnique({
        where: { id: payload?.id },
      });
      if (!user) {
        throw new NotFoundException("This user doesn't exist");
      }
      return { id: payload.id, email: payload.email };
    } catch (error) {
      this.logger.error('Failed ', error);
      console.error('Failed to return user values', error);
      throw new UnauthorizedException('Failed to return user values', error);
    }
  }
  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtServ.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const isBlacklisted = await this.redisService.get(`bl_ref:${refreshToken}`);
      if (isBlacklisted) {
        throw new UnauthorizedException('Refresh token is blacklisted');
      }
      const remainingTime = payload.exp - Math.floor(Date.now() / 1000);
      if (remainingTime > 0) {
        await this.redisService.setWithExpiry(`bl_ref:${refreshToken}`, 'true', remainingTime);
      }
      const tokens = await this.generateTokens({ id: payload.id, email: payload.email });
      return tokens;
    } catch (error) {
      this.logger.error('Failed to generate new pair of tokens ', error);
      throw new InternalServerErrorException('Failed to generate new pair of tokens', error);
    }
  }
  async generateTokens(payload: { id: string; email: string }): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtServ.signAsync(
        { id: payload.id, email: payload.email },
        { secret: process.env.JWT_SECRET, expiresIn: '15m' },
      ),
      this.jwtServ.signAsync(
        { id: payload.id, email: payload.email },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }
  async isEmailAvailable(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email },
      select: { id: true },
    });
    return { isAvailable: !user };
  }
}
