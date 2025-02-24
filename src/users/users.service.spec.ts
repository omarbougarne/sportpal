import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './schema/users.schema';
import { CreateUserDto } from './dto/create.user.dto';
import { Role } from './enums/role.enum';
import * as bcrypt from 'bcrypt';


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


});