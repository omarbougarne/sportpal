import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { Group, GroupSchema } from './schema/group.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from 'src/users/users.service';
import { User, UserSchema } from 'src/users/schema/users.schema';
import { Location, LocationSchema } from 'src/location/schema/location.schema';
import { LocationService } from 'src/location/location.service';
import { GeocodingService } from 'src/geocoding/geocoding.service';
// import { LocationSchema } from 'src/location/schema/location.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }, { name: User.name, schema: UserSchema }, { name: Group.name, schema: GroupSchema }, { name: Location.name, schema: LocationSchema }])
  ],
  providers: [GroupService, UsersService, LocationService, GeocodingService],
  controllers: [GroupController],
  exports: [GroupService],
})
export class GroupModule { }
