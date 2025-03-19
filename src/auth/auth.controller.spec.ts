
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        // Mock AuthService
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue({ accessToken: 'test-token' }),
            register: jest.fn().mockResolvedValue({ id: 'user-id', email: 'test@example.com' }),
            validateUser: jest.fn(),
            refreshToken: jest.fn(),
            // Add any other methods your controller uses
          },
        },
        // Mock JwtService if needed by AuthService
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
            verify: jest.fn().mockReturnValue({ sub: 'user-id' }),
          },
        },
        // Mock UsersService if needed by AuthService
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            // Add any other methods needed
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test for login endpoint
  describe('login', () => {
    it('should return an access token when credentials are valid', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const expectedResult = { access_token: 'test-token' }; // Changed from accessToken to access_token

      jest.spyOn(authService, 'login').mockResolvedValue(expectedResult);

      expect(await controller.login(loginDto as any)).toBe(expectedResult);
    });
  });

  // Test for register endpoint
  describe('signup', () => {  // Change method name in description
    it('should register a new user', async () => {
      const registerDto = {
        email: 'new@example.com',
        password: 'newpassword123',
        name: 'New User'
      };
      // Fix duplicate variable declaration
      const expectedResult = { access_token: 'test-token' };
      jest.spyOn(authService, 'signUp').mockResolvedValue(expectedResult as any);

      expect(await controller.signup(registerDto as any)).toBe(expectedResult);  // Change method name here
    });
  });

  // Add more tests for other controller methods as needed
});