import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Location, LocationSchema } from './schema/location.schema';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { GeocodingService } from '../geocoding/geocoding.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Location.name, schema: LocationSchema }]),
    ConfigModule,
  ],
  controllers: [LocationController],
  providers: [LocationService, GeocodingService],
  exports: [LocationService],
})
export class LocationModule { }