import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { Role } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaMock: DeepMockProxy<PrismaService>;
  let jwtMock: DeepMockProxy<JwtService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaService>();
    jwtMock = mockDeep<JwtService>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: JwtService, useValue: jwtMock },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get(UsersService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should throw ConflictException if user already exists ', async () => {
    const registerDto = { email: 'pajalok@wp.pl', password: 'paja123#' };
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'existing-id',
      email: 'pajalok@wp.pl',
      password: 'paja123#',
      role: 'STUDENT',
      onboardingComplete: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(service.registerUser(registerDto as any)).rejects.toThrow(
      ConflictException,
    );
  });
  it('should create a user on success', async () => {
    const registerDto = { email: 'new@wp.pl', password: 'password123' };

    prismaMock.user.findUnique.mockResolvedValue(null);

    const expectedUser = {
      id: 'new-cuid',
      email: 'newuser',
      password: 'newuser',
      role: Role.STUDENT,
      onboardingComplete: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prismaMock.user.create.mockResolvedValue(expectedUser);

    const result = await service.registerUser(registerDto as any);

    expect(result).toEqual(expectedUser);
    expect(prismaMock.user.create).toHaveBeenCalled();
  });
  it('should complete profile ', async () => {
    const userId = 'user-123';
    const completeProfileMockDto = { username: 'JacuśHot40' };
    const expectedProfile = {
      id: 'new-cuid',
      userId,
      displayName: 'JacuśHot40',
      ...completeProfileMockDto,
    };
    await prismaMock.$transaction.mockImplementation(async (transact: any) => {
      return await transact(prismaMock);
    });
    await prismaMock.profile.create.mockResolvedValue(expectedProfile as any);
    const result = await service.createProfile(userId, completeProfileMockDto);
    expect(result).toEqual(expectedProfile);
    expect(prismaMock.profile.create).toHaveBeenCalledWith({
      data: {
        userId,
        displayName: 'JacuśHot40',
        ...completeProfileMockDto,
      },
    });
  });
  // it("should return profile", async () =>{
  //   const mockUserId="user-123"
  //   const expectedResult={
  //   id: "user-123",
  //   email: "someemail@gmail.com",
  //   role: Role.STUDENT,
  //   onboardingComplete: true,
  //   createdAt: new Date(),
  //   updatedAt:new Date,

  //   }
  //   prismaMock.user.findUnique.mockResolvedValue(expectedResult)
  //   const result= await service.getProfile(mockUserId)
  //   expe
  // })
});
