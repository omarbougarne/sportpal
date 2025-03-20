import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Role } from '../users/enums/role.enum';
import { User } from '../users/schema/users.schema';

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
    role: [Role.User],
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
            create: jest.fn().mockResolvedValue(mockUser),
            findByEmail: jest.fn().mockResolvedValue(mockUser)
          }
        },
        // Mock JwtService
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue(mockAccessToken)
          }
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
      const result = await authService.signUp(mockCreateUserDto);

      expect(usersService.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should propagate errors from usersService', async () => {
      const error = new Error('Failed to create user');
      jest.spyOn(usersService, 'create').mockRejectedValueOnce(error);

      await expect(authService.signUp(mockCreateUserDto)).rejects.toThrow(error);
    });
  });

  describe('login', () => {
    it('should return access token when credentials are valid', async () => {
      // Setup bcrypt to return true for password comparison
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login('test@example.com', 'Password123!');

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('Password123!', 'hashedPassword123');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: '123456789012345678901234',
        email: 'test@example.com'
      });
      expect(result).toEqual({ access_token: mockAccessToken });
    });

    it('should throw unauthorized exception when user is not found', async () => {
      // Override the mock to return null for this test
      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce(null);

      await expect(authService.login('wrong@example.com', 'Password123!')).rejects.toThrow(
        new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED)
      );
    });

    it('should throw unauthorized exception when password is incorrect', async () => {
      // Setup bcrypt to return false for this test
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(authService.login('test@example.com', 'WrongPassword!')).rejects.toThrow(
        new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED)
      );
    });
  });
});