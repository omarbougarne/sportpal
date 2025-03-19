import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schema/users.schema';
import { JwtAuthGuard } from '../auth/common/guards/jwt-auth.guard'; // Update path as needed

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        // Mock UsersService
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            findById: jest.fn().mockResolvedValue({}),
            create: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
            remove: jest.fn().mockResolvedValue({}),
            // Add any other methods your controller uses
          },
        },
        // Mock JwtService for JwtAuthGuard
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
            verify: jest.fn().mockReturnValue({ sub: 'user-id' }),
          },
        },
        // Mock User Model
        {
          provide: getModelToken(User.name),
          useValue: {
            find: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue([]),
            findById: jest.fn(),
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndRemove: jest.fn(),
            // Add any other model methods needed
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard) // This simplifies testing protected routes
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Now add specific tests for your controller methods
  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = [{
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password-123',
        role: ['user'],
        location: { type: 'Point', coordinates: [0, 0] }
      }];
      jest.spyOn(usersService, 'findAll').mockResolvedValue(result as any);

      expect(await controller.findAll()).toBe(result);
    });
  });

  // Add more test cases for other controller methods
});