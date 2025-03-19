import { Test, TestingModule } from '@nestjs/testing';
import { ContractService } from './contract.service';
import { getModelToken } from '@nestjs/mongoose';
import { Contract } from './schema/contract.schema';
import { TrainerService } from '../trainer/trainer.service';
import { UsersService } from '../users/users.service';
import { Model } from 'mongoose';

describe('ContractService', () => {
  type SpyInstance = jest.SpyInstance<any, any>;
  let service: ContractService;
  let contractModel: Model<Contract>;
  let trainerService: TrainerService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractService,

        {
          provide: getModelToken(Contract.name),
          useValue: {
            new: jest.fn(),
            constructor: jest.fn(),
            find: jest.fn().mockReturnThis(),
            findOne: jest.fn(),
            findById: jest.fn().mockResolvedValue({ id: 'trainer-123', name: 'Test Trainer' }),
            update: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
            exec: jest.fn(),
            save: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            populate: jest.fn().mockReturnThis(),
          },
        },

        {
          provide: TrainerService,
          useValue: {
            findById: jest.fn(),
            isUserTrainer: jest.fn(),

          },
        },

        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),

          },
        },
      ],
    }).compile();

    service = module.get<ContractService>(ContractService);
    contractModel = module.get<Model<Contract>>(getModelToken(Contract.name));
    trainerService = module.get<TrainerService>(TrainerService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  describe('create', () => {
    it('should create a new contract', async () => {
      const createContractDto = {
        trainerId: 'trainer-123',
        clientId: 'client-123',
        startDate: new Date(),
        endDate: new Date(),
        terms: 'Test terms',

      };

      const mockTrainer = { id: 'trainer-123', name: 'Test Trainer' };
      const mockClient = { id: 'client-123', name: 'Test Client' };
      const mockContract = { id: 'contract-123', ...createContractDto };

      const trainerFindByIdSpy = jest.spyOn(trainerService, 'findById') as SpyInstance;
      trainerFindByIdSpy.mockResolvedValue(mockTrainer as any);

      const usersFindByIdSpy = jest.spyOn(usersService, 'findById') as SpyInstance;
      usersFindByIdSpy.mockResolvedValue(mockClient as any);

      const contractCreateSpy = jest.spyOn(contractModel, 'create') as SpyInstance;
      contractCreateSpy.mockResolvedValue(mockContract as any);

      expect(await service.create(createContractDto as any)).toEqual(mockContract);
    });
  });

  describe('findAll', () => {
    it('should return all contracts', async () => {
      const mockContracts = [{ id: 'contract-1' }, { id: 'contract-2' }];

      jest.spyOn(contractModel, 'find').mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockContracts),
      } as any);

      expect(await service.findAll()).toEqual(mockContracts);
    });
  });


});