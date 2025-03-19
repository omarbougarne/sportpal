import { Test, TestingModule } from '@nestjs/testing';
import { TrainerService } from './trainer.service';
import { getModelToken } from '@nestjs/mongoose';
import { Trainer } from './schema/tariner.schema';
import { UsersService } from '../users/users.service';
import { Model } from 'mongoose';

describe('TrainerService', () => {
  let service: TrainerService;
  let trainerModel: Model<Trainer>;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrainerService,
        // Mock TrainerModel
        {
          provide: getModelToken(Trainer.name),
          useValue: {
            new: jest.fn(),
            constructor: jest.fn(),
            find: jest.fn().mockReturnThis(),
            findOne: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
            exec: jest.fn(),
            // Add any other methods used in your service
          },
        },
        // Mock UsersService
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
            findOne: jest.fn(),
            // Add other UsersService methods used by TrainerService
          },
        },
      ],
    }).compile();

    service = module.get<TrainerService>(TrainerService);
    trainerModel = module.get<Model<Trainer>>(getModelToken(Trainer.name));
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more test cases for service methods
  describe('findAll', () => {
    it('should return all trainers', async () => {
      // Create a mock query DTO with default values
      const mockQueryDto = {
        limit: 20,
        skip: 0
        // Other fields are optional
      };

      const mockTrainers = [{ name: 'Trainer 1' }, { name: 'Trainer 2' }];
      const mockResult = { trainers: mockTrainers, total: 2 };

      // Mock the countDocuments and find chain
      jest.spyOn(trainerModel, 'countDocuments').mockResolvedValueOnce(2);
      jest.spyOn(trainerModel, 'find').mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(mockTrainers),
      } as any);

      const result = await service.findAll(mockQueryDto);
      expect(result).toEqual(mockResult);
    });
  });

  // Add tests for other methods like create, findById, update, etc.
});