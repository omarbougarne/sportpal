import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './schema/users.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: User;

  beforeEach(async () => {
    const mockUserModel = {
      create: jest.fn(),
      findUser: jest.fn()
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
    userModel = module.get(getModelToken(User.name))
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () =>{
    it('Should create a unique user with hashed password', async () => {
      const createUserDto = {
        name: 'omar',
        email: 'omar@email.com',
        password: 'supersecure'
      };

    })
  })
});
