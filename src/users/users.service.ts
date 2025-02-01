import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/users.schema';
import { CreateUserDto } from './dto/create.user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update.user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.userModel.findOne({ email: createUserDto.email }).exec();
      if (existingUser) {
        throw new HttpException('User already exists', HttpStatus.CONFLICT);
      }

      // Hash the password
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

      // Create the new user
      const createUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
      });

      return await createUser.save();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error creating user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findUser(email: string): Promise<User | undefined> {
  
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new HttpException('User with this email does not exist', HttpStatus.NOT_FOUND);
    }
    return user;
  
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User>{
    const user = this.userModel.findByIdAndUpdate(userId, updateUserDto, { new: true }).exec();
    if(!user){
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }
    return user;
  }

  async sofDeleteUsers(userId: string): Promise<User>{
    const user = this.userModel.findByIdAndUpdate(userId, {deletedAt: new Date}, { new: true }).exec();
    if(!user){
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }
    return user;
  }

  async permanentlyDeleteUsers(): Promise<void>{
    const pastThirtyDays = new Date();
    pastThirtyDays.setDate(pastThirtyDays.getDate() - 30)
    await  this.userModel.deleteMany({deletedAt: { $lte: pastThirtyDays }}).exec()
    
  }
}
