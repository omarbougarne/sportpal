import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { User, UserDocument } from './schema/users.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './enums/role.enum';
import { GeocodingService } from 'src/geocoding/geocoding.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>,
    private geocodingService: GeocodingService
  ) { }
  async findOne(id: string): Promise<UserDocument> {
    // const userId = new Types.ObjectId(id);
    const user = await this.userModel.findOne({ id });
    return user;
  }
  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
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
      return savedUser;
    } catch (error) {
      this.logger.error('Error creating user', error.stack)
      throw new HttpException('Error creating user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.userModel.find().exec();
      return users;
    } catch (error) {
      this.logger.error('Error finding users', error.stack)
      throw new HttpException('Error finding users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findById(id: string): Promise<UserDocument> {
    try {
      this.logger.log(`Received ID: ${id}`);
      if (!isValidObjectId(id)) {
        this.logger.error(`Invalid user ID format: ${id}`);
        throw new HttpException('Invalid user ID format', HttpStatus.BAD_REQUEST);
      }
      const userId = new Types.ObjectId(id);
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      this.logger.error('Error finding user', error.stack);
      throw new HttpException('Error finding user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  // async findByEmail(email: string): Promise<UserDocument> {
  //   return this.userModel.findOne({ email }).exec();
  // }
  async findByEmail(email: string): Promise<UserDocument> {
    try {
      const user = await this.userModel.findOne({ email }).exec();
      if (!user) {
        throw new HttpException('User with this email does not exist', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      this.logger.error('Error finding user', error.stack);
      throw new HttpException('Error finding user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      if (!isValidObjectId(userId)) {
        throw new HttpException('Invalid user ID format', HttpStatus.BAD_REQUEST);
      }
      const id = new Types.ObjectId(userId);
      const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
      if (!user) {
        throw new HttpException('User with this email does not exist', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      this.logger.error('Error updating user', error.stack);
      throw new HttpException('Error updating user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateUserGroups(userId: string, groupId: Types.ObjectId, role: Role): Promise<User> {
    try {
      if (!isValidObjectId(userId)) {
        throw new HttpException('Invalid user ID format', HttpStatus.BAD_REQUEST);
      }
      const id = new Types.ObjectId(userId);
      const user = await this.userModel.findByIdAndUpdate(id,
        { $addToSet: { groups: groupId }, role },
        { new: true }
      ).exec();
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND)
      }
      return user;
    } catch (error) {
      this.logger.error('Error updating user groups', error.stack)
      throw new HttpException('Error updating user groups', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async softDeleteUser(userId: string): Promise<User> {
    try {
      if (!isValidObjectId(userId)) {
        throw new HttpException('Invalid user ID format', HttpStatus.BAD_REQUEST);
      }
      const id = new Types.ObjectId(userId);
      const user = await this.userModel.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true }).exec();
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND)
      }
      return user;
    } catch (error) {
      this.logger.error('Error soft deleting user', error.stack)
      throw new HttpException('Error soft deleting user', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async permanentlyDeleteUsers(): Promise<void> {
    try {
      const pastThirtyDays = new Date();
      pastThirtyDays.setDate(pastThirtyDays.getDate() - 30)
      const result = await this.userModel.deleteMany({ deletedAt: { $lte: pastThirtyDays } }).exec()
      this.logger.log(`Permanently deleted ${result.deletedCount} users`)
    } catch (error) {
      this.logger.error('Error permanently deleting users', error.stack);
      throw new HttpException('Error permanently deleting users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // In users.service.ts

  // Update user location by address
  async updateUserLocationByAddress(userId: string, addressData: any): Promise<User> {
    try {
      const { address, district, city, country } = addressData;

      // Geocode address to coordinates
      const addressToGeocode = [address, district, city, country]
        .filter(Boolean)
        .join(', ');

      const { longitude, latitude } = await this.geocodingService.geocode(addressToGeocode);

      // Update user with new location
      return this.userModel.findByIdAndUpdate(
        userId,
        {
          $set: {
            location: {
              type: 'Point',
              coordinates: [longitude, latitude]
            }
          }
        },
        { new: true }
      ).exec();
    } catch (error) {
      throw new HttpException('Error updating user location', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Update user location directly with coordinates
  async updateUserLocation(userId: string, longitude: number, latitude: number): Promise<User> {
    try {
      return this.userModel.findByIdAndUpdate(
        userId,
        {
          $set: {
            location: {
              type: 'Point',
              coordinates: [longitude, latitude]
            }
          }
        },
        { new: true }
      ).exec();
    } catch (error) {
      throw new HttpException('Error updating user location', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Find nearby users
  async findNearbyUsers(userId: string, maxDistance: number = 5000, limit: number = 20): Promise<User[]> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user || !user.location) {
        throw new HttpException('User not found or has no location', HttpStatus.BAD_REQUEST);
      }

      // Find users within radius excluding the requesting user
      return this.userModel.find({
        _id: { $ne: userId },
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: user.location.coordinates
            },
            $maxDistance: maxDistance
          }
        }
      })
        .limit(limit)
        .select('-password') // Exclude sensitive data
        .exec();
    } catch (error) {
      throw new HttpException('Error finding nearby users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async updateRole(userId: string, role: Role): Promise<User> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );
  }
}
