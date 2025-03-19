import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { getModelToken } from '@nestjs/mongoose';
import { Contract } from './schema/contract.schema';
import { TrainerService } from '../trainer/trainer.service'; // Add this import

describe('ContractController', () => {
  let controller: ContractController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractController],
      providers: [
        ContractService,
        // Mock ContractModel
        {
          provide: getModelToken(Contract.name),
          useValue: {
            find: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([]),
            }),
            create: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            // Add other methods you need
          },
        },
        // Mock TrainerService - This is what was missing
        {
          provide: TrainerService,
          useValue: {
            findById: jest.fn().mockResolvedValue({}),
            isUserTrainer: jest.fn().mockResolvedValue(true),
            // Add other methods you need
          },
        },
        // Mock UsersService
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn().mockResolvedValue({}),
            // Add other methods you need
          },
        },
        // Mock JwtService
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
            verify: jest.fn().mockReturnValue({ sub: 'user-id' }),
          },
        },
      ],
    }).compile();

    controller = module.get<ContractController>(ContractController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Your other tests
});