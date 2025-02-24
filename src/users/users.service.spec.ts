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


describe('UsersService', () => {
    let service: UsersService;
    let userModel: any

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
        it('Should create a user successfully', async () => {
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
        })
    })
});