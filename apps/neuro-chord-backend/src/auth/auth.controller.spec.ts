import type { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended';
import type { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let prismaMock: DeepMockProxy<PrismaService>;
  let mockJwt: DeepMockProxy<JwtService>;

  const mockUsersService = {
    registerUser: jest.fn(),
    loginUser: jest.fn(),
    createProfile: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaService>();
    mockJwt = mockDeep<JwtService>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: 'AuthGuard',
          useValue: { canActivate: jest.fn(() => true) },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('Should return user profile based on request user id', async () => {
    const mockUserFromDb = { id: 'user-123', email: 'someuser@gmail.com' };
    const mockRequest = {
      user: {
        id: 'user-123',
        sub: 'user-123',
      },
    };
    mockUsersService.getProfile.mockResolvedValue(mockUserFromDb);
    const result = await controller.getProfile(mockRequest as any);
    expect(mockUsersService.getProfile).toHaveBeenCalledWith('user-123');
    expect(result).toEqual(mockUserFromDb);
  });
  it('should return user id ', async () => {
    const mockBody = {
      email: 'someemail@wp.pl',
      password: 'pass123',
    };
    const mockResponse = {
      accessToken: 'asdfdsaf12wd',
    };
    mockUsersService.loginUser.mockResolvedValue(mockResponse);
    const result = controller.login(req, res, userData);
    expect(mockUsersService.loginUser).toHaveBeenCalledWith(mockBody);
    expect(result).toEqual(mockResponse);
  });
});
