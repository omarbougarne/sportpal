import { Test, TestingModule } from '@nestjs/testing';
import { TrainerController } from './trainer.controller';
import { TrainerService } from './trainer.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { getModelToken } from '@nestjs/mongoose';
import { Trainer } from './schema/tariner.schema';

describe('TrainerController', () => {
  let controller: TrainerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainerController],
      providers: [
        // Provide TrainerService
        {
          provide: TrainerService,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn().mockResolvedValue([]),
            update: jest.fn(),
            remove: jest.fn(),
            // Add any other methods your controller uses
          },
        },
        // Provide JwtService for JwtAuthGuard
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
            verify: jest.fn().mockReturnValue({ sub: 'user-id' }),
          },
        },
        // Provide UsersService for JwtAuthGuard
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn().mockResolvedValue({ id: 'user-id', name: 'Test User' }),
            // Add any other methods your controller uses
          },
        },
        // Provide TrainerModel if needed
        {
          provide: getModelToken(Trainer.name),
          useValue: {
            find: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue([]),
            findById: jest.fn(),
            create: jest.fn(),
            // Add any other model methods your service uses
          },
        }
      ],
    }).compile();

    controller = module.get<TrainerController>(TrainerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Add more tests for controller methods
});