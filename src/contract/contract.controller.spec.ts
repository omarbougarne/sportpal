// In your test file
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { getModelToken } from '@nestjs/mongoose';
import { Contract } from './schema/contract.schema';

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
            // Your model mock methods here
            find: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([]),
            }),
          },
        },
        // Mock UsersService
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
            // Other methods you need
          },
        },
        // Mock JwtService - This is what was missing
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