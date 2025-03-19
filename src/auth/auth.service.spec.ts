import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Role } from '../users/enums/role.enum';

// Mock bcrypt
jest.mock('bcryptjs');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  // Setup mock data
  const mockUser = {
    _id: '123456789012345678901234',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword123',
    toString: jest.fn().mockReturnValue('123456789012345678901234')
  };

  const mockCreateUserDto: CreateUserDto = {
    email: 'test@example.com',
    name: 'Test User',
    password: 'Password123!',
    role: Role.User
  };

  const mockAccessToken = 'mock.jwt.token';

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        // Mock UsersService
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn()
          }
        },
        // Mock JwtService
        {
          provide: JwtService,
          useValue: { sign: jest.fn() }
        }
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    usersService = moduleRef.get<UsersService>(UsersService);
    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signUp', () => {
    it('should create a new user and return the user document', async () => {
      // Setup
      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser as any);

      // Execute
      const result = await authService.signUp(mockCreateUserDto);

      // Assert
      expect(usersService.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should propagate errors from usersService', async () => {
      // Setup
      const error = new Error('Failed to create user');
      jest.spyOn(usersService, 'create').mockRejectedValue(error);

      // Execute & Assert
      await expect(authService.signUp(mockCreateUserDto)).rejects.toThrow(error);
    });
  });

  describe('login', () => {
    it('should return access token when credentials are valid', async () => {
      // Setup
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockAccessToken);

      // Execute
      const result = await authService.login('test@example.com', 'Password123!');

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('Password123!', 'hashedPassword123');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: '123456789012345678901234',
        email: 'test@example.com'
      });
      expect(result).toEqual({ access_token: mockAccessToken });
    });

    it('should throw unauthorized exception when user is not found', async () => {
      // Setup
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      // Execute & Assert
      await expect(authService.login('wrong@example.com', 'Password123!')).rejects.toThrow(
        new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED)
      );
    });

    it('should throw unauthorized exception when password is incorrect', async () => {
      // Setup
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Execute & Assert
      await expect(authService.login('test@example.com', 'WrongPassword!')).rejects.toThrow(
        new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED)
      );
    });
  });

  // We don't test private methods directly, but they're covered by login test
});