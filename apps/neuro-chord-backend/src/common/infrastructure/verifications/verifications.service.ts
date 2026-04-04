import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { SecurityService } from "@security/security.service";
import { nanoid } from "nanoid";
import { PinoLogger } from "nestjs-pino";
import { getNow } from "src/utils";
@Injectable()
export class VerificationService {
  constructor(
    private prisma: PrismaService,
    private logger: PinoLogger,
    private securityService: SecurityService,
  ) {}

  public async createToken(userId: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;
    return await client.verification.create({
      data: {
        userId,
        token: nanoid(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // +24h
      },
    });
  }
  public async verifyToken(token: string) {
    try {
      const verifiedUser = await this.findToken(token);

      if (!verifiedUser) {
        throw new UnauthorizedException("Verification token not found");
      }
      const now = getNow();
      const remainingTime =
        Math.floor(verifiedUser.expiresAt.getTime() / 1000) - now;
      if (remainingTime <= 0) {
        throw new UnauthorizedException("Verification token already expired");
      }
      return verifiedUser;
    } catch (error) {
      this.logger.error("Failed to verify token", error);
      throw new InternalServerErrorException("Failed to verify token");
    }
  }
  public async findToken(token: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;
    try {
      if (!token) {
        throw new NotFoundException("Token wasn't provided");
      }
      const verificationToken = await client.verification.findUnique({
        where: { token },
      });
      if (!verificationToken) {
        throw new NotFoundException("Verification token no found");
      }
      return verificationToken;
    } catch (error) {
      this.logger.error("Failed to find token", error);
      throw new Error("Failed to find token ");
    }
  }
  public async deleteToken(token: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;
    try {
      return await client.verification.delete({
        where: { token },
      });
    } catch (error) {
      this.logger.error("Failed to delete verification token", error);
      throw new InternalServerErrorException(
        "Failed to delete verification token",
      );
    }
  }
  public async deleteVerifiedUser(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;
    return await client.verification.delete({
      where: { id },
    });
  }
  public async createVerification(userData: any, token: string) {
    const hashed = await this.securityService.hashPassword("temp");
    const nowInSec = Math.floor(Date.now() / 1000);
    const expiresAt = nowInSec + 24 * 60 * 60;
    return await this.prisma.verification.create({
      data: {
        token: token,
        expiresAt: new Date(expiresAt * 1000),
        user: {
          create: {
            email: userData.email,
            password: hashed,
            role: "STUDENT",
          },
        },
      },
      include: { user: true },
    });
  }
}
