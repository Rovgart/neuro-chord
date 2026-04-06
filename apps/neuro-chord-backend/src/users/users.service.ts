import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  public async findAll() {
    return this.prisma.user.findMany();
  }
  private async createUser(email: string, password: string, role?: Role, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;
    const user = await client.user.create({
      data: {
        email: email,
        password: password,
        role: role,
      },
    });
    return user;
  }
  private async updateUser(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx || this.prisma;
    return await client.user.update({ where, data });
  }
  public async updateStudent(id: string, data: Partial<Prisma.UserUpdateInput>, tx?: Prisma.TransactionClient) {
    return this.updateUser({ id }, { ...data, role: Role.STUDENT }, tx);
  }

  public async updateTeacher(id: string, data: Partial<Prisma.UserUpdateInput>, tx?: Prisma.TransactionClient) {
    return this.updateUser({ id }, { ...data, role: Role.TEACHER }, tx);
  }

  public async promoteToAdmin(id: string, tx?: Prisma.TransactionClient) {
    return this.updateUser({ id }, { role: Role.ADMIN }, tx);
  }
  public async createTeacher(email: string, password: string, tx?: Prisma.TransactionClient) {
    return await this.createUser(email, password, Role.TEACHER, tx);
  }
  public async createAdmin(email: string, password: string, tx?: Prisma.TransactionClient) {
    return await this.createUser(email, password, Role.ADMIN, tx);
  }
  public async createStudent(email: string, password: string, tx?: Prisma.TransactionClient) {
    return await this.createUser(email, password, Role.STUDENT, tx);
  }
  public async createTempUser(email: string, password: string, tx?: Prisma.TransactionClient) {
    return await this.createUser(email, password, Role.STUDENT, tx);
  }
  private async find(
    where: Prisma.UserWhereUniqueInput,
    tx?: Prisma.TransactionClient,
    includeSessions: boolean = false,
  ) {
    const client = tx || this.prisma;
    return await client.user.findUnique({
      where,
      include: includeSessions ? { sessions: true } : undefined,
    });
  }

  public async findByEmail(email: string, includeSessions: boolean = false, tx?: Prisma.TransactionClient) {
    return await this.find({ email }, tx, includeSessions);
  }

  public async findById(id: string, tx?: Prisma.TransactionClient, includeSessions: boolean = true) {
    return await this.find({ id }, tx, includeSessions);
  }

  public async verifyUser(email: string) {
    if (!email) {
      throw new UnauthorizedException("Email wasn't provided");
    }
    const isExisting = await this.prisma.user.findUnique({
      where: { email },
    });
    if (isExisting) {
      throw new BadRequestException('User with this e-mail already exists');
    }
  }
  public async updateNewPassword(userId: string, newPassword: string) {
    await this.updateUser({ id: userId }, { password: newPassword });
  }
}
