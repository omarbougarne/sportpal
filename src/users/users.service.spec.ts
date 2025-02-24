import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './schema/users.schema';
import { CreateUserDto } from './dto/create.user.dto';
import { Role } from './enums/role.enum';
import * as bcrypt from 'bcrypt';
import { Level } from './enums/level.enum';
import { Availability } from './enums/availability.enum';
import { AccountStatus } from './enums/account-status.enum';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('UsersService', () => {
    let service: UsersService;
    let userModel: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getModelToken(User.name),
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        userModel = module.get(getModelToken(User.name));
    });

    describe('create', () => {
        it('should create a user successfully', async () => {
            const createUserDto: CreateUserDto = {
                name: 'John Doe',
                email: 'john.doe@example.com',
                password: 'securePassword123',
                profileImageUrl: 'http://example.com/profile.jpg',
                favoriteSports: ['Basketball', 'Soccer'],
                level: Level.Intermediate,
                availability: Availability.Evening,
                role: Role.User,
                preferences: {
                    newsletter: true,
                    notifications: {
                        email: true,
                        sms: false,
                    },
                },
                contactInfo: {
                    phone: '123-456-7890',
                    address: '123 Main St, Anytown, USA',
                },
                accountStatus: AccountStatus.Active,
            };

            jest.spyOn(userModel, 'findOne').mockResolvedValue(null);
            jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
            const saveMock = jest.fn().mockResolvedValue({
                ...createUserDto,
                password: 'hashedPassword',
            });
            userModel.mockImplementation(() => ({ save: saveMock }));

            const result = await service.create(createUserDto);

            expect(result.data).toEqual({
                ...createUserDto,
                password: 'hashedPassword',
            });
        });

        it('should throw an error if user already exists', async () => {
            const createUserDto: CreateUserDto = {
                name: 'John Doe',
                email: 'john.doe@example.com',
                password: 'securePassword123',
                profileImageUrl: 'http://example.com/profile.jpg',
                favoriteSports: ['Basketball', 'Soccer'],
                level: Level.Intermediate,
                availability: Availability.Evening,
                role: Role.User,
                preferences: {
                    newsletter: true,
                    notifications: {
                        email: true,
                        sms: false,
                    },
                },
                contactInfo: {
                    phone: '123-456-7890',
                    address: '123 Main St, Anytown, USA',
                },
                accountStatus: AccountStatus.Active,
            };

            jest.spyOn(userModel, 'findOne').mockResolvedValue(createUserDto);

            await expect(service.create(createUserDto)).rejects.toThrow(
                new HttpException('User already exists', HttpStatus.CONFLICT),
            );
        });

        it('should throw an error if there is an issue creating the user', async () => {
            const createUserDto: CreateUserDto = {
                name: 'John Doe',
                email: 'john.doe@example.com',
                password: 'securePassword123',
                profileImageUrl: 'http://example.com/profile.jpg',
                favoriteSports: ['Basketball', 'Soccer'],
                level: Level.Intermediate,
                availability: Availability.Evening,
                role: Role.User,
                preferences: {
                    newsletter: true,
                    notifications: {
                        email: true,
                        sms: false,
                    },
                },
                contactInfo: {
                    phone: '123-456-7890',
                    address: '123 Main St, Anytown, USA',
                },
                accountStatus: AccountStatus.Active,
            };

            jest.spyOn(userModel, 'findOne').mockResolvedValue(null);
            jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
            const saveMock = jest.fn().mockRejectedValue(new Error('Error creating user'));
            userModel.mockImplementation(() => ({ save: saveMock }));

            await expect(service.create(createUserDto)).rejects.toThrow(
                new HttpException('Error creating user', HttpStatus.INTERNAL_SERVER_ERROR),
            );
        });
    });
});