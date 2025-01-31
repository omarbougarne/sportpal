import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './schema/users.schema';
import { CreateUserDto } from './dto/create.user.dto';
import { Role } from './enums/role.enum';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: any;

  beforeEach(async () => {
    const mockUserModel = {
      create: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a unique user with a hashed password', async () => {
      const createUserDto: CreateUserDto = {
        name: 'omar',
        email: 'omar@email.com',
        password: 'securepass',
        role: Role.User,
      };

      
      userModel.findOne.mockResolvedValue(createUserDto);
      await expect(service.create(createUserDto)).rejects.toThrow('User already exists');
    });
  });
  
});
