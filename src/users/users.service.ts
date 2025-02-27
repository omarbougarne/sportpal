import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schema/users.schema';
import { CreateUserDto } from './dto/create.user.dto';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/update.user.dto';
import { Role } from './enums/role.enum';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async create(createUserDto: CreateUserDto): Promise<{ data: User }> {
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

      const savedUser = await createUser.save()
      return { data: savedUser };
    } catch (error) {
      this.logger.error('Error creating user', error.stack)
      throw new HttpException('Error creating user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(): Promise<{ data: User[] }> {
    try {
      const users = await this.userModel.find().exec();
      return { data: users }
    } catch (error) {
      this.logger.error('Error finding users', error.stack)
      throw new HttpException('Error finding users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string): Promise<{ data: User }> {
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return { data: user };
    } catch (error) {
      this.logger.error('Error finding user', error.stack)
      throw new HttpException('Error creating user', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async findByEmail(email: string): Promise<{ data: User }> {
    try {
      const user = await this.userModel.findOne({ email }).exec();
      if (!user) {
        throw new HttpException('User with this email does not exist', HttpStatus.NOT_FOUND);
      }
      return { data: user };
    } catch (error) {
      this.logger.error('Error finding user', error.stack)
      throw new HttpException('Error creating user', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<{ data: User }> {
    try {
      const user = await this.userModel.findByIdAndUpdate(userId, updateUserDto, { new: true }).exec();
      if (!user) {
        throw new HttpException('User with this email does not exist', HttpStatus.NOT_FOUND);
      }
      return { data: user };
    } catch (error) {
      this.logger.error('Error finding user', error.stack)
      throw new HttpException('Error creating user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateUserGroups(userId: string, groupId: Types.ObjectId, role: Role): Promise<{ data: User }> {
    try {
      const user = await this.userModel.findByIdAndUpdate(userId,
        { $addToSet: { groups: groupId }, role },
        { new: true }
      ).exec();
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND)
      }
      return { data: user }
    } catch (error) {
      this.logger.error('Error Updating user groups', error.stack)
      throw new HttpException('Error Updating user groups', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async sofDeleteUsers(userId: string): Promise<{ data: User }> {
    try {
      const user = await this.userModel.findByIdAndUpdate(userId, { deletedAt: new Date }, { new: true }).exec();
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND)
      }
      return { data: user };
    } catch (error) {
      this.logger.error('Error finding user', error.stack)
      throw new HttpException('Error creating user', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async permanentlyDeleteUsers(): Promise<void> {
    try {
      const pastThirtyDays = new Date();
      pastThirtyDays.setDate(pastThirtyDays.getDate() - 30)
      const result = await this.userModel.deleteMany({ deletedAt: { $lte: pastThirtyDays } }).exec()
      this.logger.log(`Premanently deleted ${result.deletedCount} users`)
    } catch (error) {
      this.logger.error('Error permanently deleting users', error.stack);
      throw new HttpException('Error permanently deleting users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
