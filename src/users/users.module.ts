import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/users.schema';
import { UsersController } from './users.controller';
import { GeocodingService } from 'src/geocoding/geocoding.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersService, GeocodingService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule { }
