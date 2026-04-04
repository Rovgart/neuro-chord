import { Injectable } from "@nestjs/common";
import { Prisma, Session } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";

interface SessionServiceI {
  createSession(
    userId: string,
    devInfo: { ip: string; ua: string },
    tx: Prisma.TransactionClient,
  ): Promise<Session>;
  deleteSession: (sessionId: string, userId: string) => Promise<void>;
  getSession(
    sessionId: string,
  ): Promise<{ userId: string; userAgent: string } | null>;
}
@Injectable()
export class SessionService implements SessionServiceI {
  constructor(private prisma: PrismaService) {}
  public async createSession(
    userId: string,
    devInfo: { ip: string; ua: string },
    tx?: Prisma.TransactionClient,
  ): Promise<Session> {
    const client = this.prisma || tx;
    return await client.session.create({
      data: {
        userAgent: devInfo.ua,
        ipAddress: devInfo.ip,
        userId: userId,
      },
    });
  }
  public async deleteSession(userId: string, sessionId: string) {
    await this.prisma.session.delete({
      where: { id: sessionId, userId },
    });
  }
  public async getSession(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });
    return session;
  }
  public async updateSession(
    sessionId: string,
    data: Partial<Prisma.SessionUpdateInput>,
  ) {
    return await this.prisma.session.update({
      where: { id: sessionId },
      data,
    });
  }
}
