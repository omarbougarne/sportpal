import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/users.schema';
import { CreateUSerDto } from './dto/create.user.dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>){}
    
    async create(createUserDto: CreateUSerDto): Promise<User>{
    try{
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt)
        const createUser = new this.userModel({
            ...createUserDto,
            password: hashedPassword
        })
        return createUser.save()
    }catch(error){
        throw new HttpException('Error Creating user', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    }

    async findUser(email: string): Promise<User | undefined>{
        try{
        const user = await this.userModel.findOne({email}).exec()
        if(!user){
            throw new HttpException('User Not Found!', HttpStatus.NOT_FOUND)
        }
        return user
    }catch(error){
        throw new HttpException('Error Finding User', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    }
}   
