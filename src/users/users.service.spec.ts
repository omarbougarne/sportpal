import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './schema/users.schema';


describe('UsersService', () => {
  let service: UsersService;
  let userModel: any;

  beforeEach(async () => {
    const mockUserModel = {
      create: jest.fn(),
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn(),
      }),
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

  // describe('create', () => {
  //   it('should create a unique user with a hashed password', async () => {
  //     const createUserDto: CreateUserDto = {
  //       name: 'omar',
  //       email: 'omar@email.com',
  //       password: 'securepass',
  //       role: Role.User,
  //     };

  //     // Simulate that the user already exists
  //     userModel.findOne.mockReturnValue({
  //       exec: jest.fn().mockResolvedValue(createUserDto),
  //     });
  //     await expect(service.create(createUserDto)).rejects.toThrow('User already exists');
  //   });

  //   it('should create a new user with a hashed password', async () => {
  //     const createUserDto: CreateUserDto = {
  //       name: 'John Doe',
  //       email: 'john.doe@example.com',
  //       password: 'securePassword123',
  //       role: Role.User,
  //     };

  //     const hashedPassword = 'hashedPassword123';
  //     jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);

  //     // Simulate that the user does not exist
  //     userModel.findOne.mockReturnValue({
  //       exec: jest.fn().mockResolvedValue(null),
  //     });
  //     userModel.create.mockResolvedValue({
  //       ...createUserDto,
  //       password: hashedPassword,
  //     });

  //     const result = await service.create(createUserDto);

  //     expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, expect.any(Number));
  //     expect(userModel.create).toHaveBeenCalledWith({
  //       ...createUserDto,
  //       password: hashedPassword,
  //     });
  //     expect(result.password).toBe(hashedPassword);
  //   });
  // });

  // describe('findOne', () => {
  //   it('should find an already existing user', async () => {
  //     const email = 'john@mail.com';
  //     const user = {
  //       name: 'john',
  //       email: 'john@mail.com',
  //       password: 'superp',
  //       role: Role.User,
  //     };

  //     userModel.findOne.mockReturnValue({
  //       exec: jest.fn().mockResolvedValue(user),
  //     });

  //     const result = await service.findOne(email);

  //     expect(userModel.findOne).toHaveBeenCalledWith({ email });
  //     expect(result).toEqual(user);
  //   });

  //   it('should throw an error if user is not found', async () => {
  //     const email = 'john@mail.com';

  //     userModel.findOne.mockReturnValue({
  //       exec: jest.fn().mockResolvedValue(null),
  //     });

  //     await expect(service.findOne(email)).rejects.toThrow('User with this email does not exist');
  //   });
  // });
});
