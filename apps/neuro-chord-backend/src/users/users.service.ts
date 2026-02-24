import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { compare, genSalt, hash } from 'bcrypt';
import { Logger } from 'nestjs-pino';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { CreateProfileDto } from 'src/users/dto/create-profile-dto';
import { LoginUserDto } from 'src/users/dto/login-user-dto';
import { RegisterUserDto } from 'src/users/dto/register-user.dto';

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
  async registerUser(userData: RegisterUserDto): Promise<User> {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: userData.email },
      });
      if (existingUser)
        throw new ConflictException(
          'User with this email address already exists',
        );
      const salt = await genSalt();
      const hashed = await hash(userData.password, salt);
      const newUser = await this.prisma.user.create({
        data: {
          email: userData.email,
          password: hashed,
          role: 'STUDENT',
        },
      });
      this.eventEmitter.emit('user.registered', {
        userId: newUser.id,
        email: newUser.email,
      });
      return newUser;
  }
  async loginUser(
    userData: LoginUserDto,
    userAgent: string,
    ipAddress: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });
    if (!user || !user.password)
      throw new UnauthorizedException('Wrong email or password');

    const isPasswordValid = await compare(userData.password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Wrong email or password');
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtServ.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });
    const refreshToken = await this.jwtServ.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });
    await this.prisma.session.create({
      data: {
        refreshToken: refreshToken,
        userId: user.id,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: 'unknown',
        ipAddress: 'unknown',
      },
    });
    return {
      accessToken,
      refreshToken,
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
      access_token: await this.jwtServ.signAsync(payload, {
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
  async fullLogout(accessToken: string, refreshToken: string) {
      await this.prisma.session.delete({
        where: { refreshToken: refreshToken },
      });
      const decoded = this.jwtServ.decode(accessToken);
      const remainingTime = decoded.exp - Math.floor(Date.now() / 1000);
      if (remainingTime > 0) {
        await this.redisService.setWithExpiry(
          `bl:${accessToken}`,
          'blacklisted',
          60 * 60,
        ); // Blacklist for 1 hour
      }

  }
}
