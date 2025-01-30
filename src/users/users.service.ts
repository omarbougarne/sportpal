import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/users.schema';
import { CreateUSerDto } from './dto/create.user.dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>){}
    
    async create(createUserDto: CreateUSerDto): Promise<User>{
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt)
        const createUser = new this.userModel({
            ...createUserDto,
            password: hashedPassword
        })
        return createUser.save()
    }

    async findUser(email: string): Promise<User | undefined>{
        return this.userModel.findOne({email}).exec()
    }
}   
