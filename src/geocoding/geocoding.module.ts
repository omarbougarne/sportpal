import { Module } from '@nestjs/common';
import { GeocodingService } from './geocoding.service';

@Module({
  providers: [GeocodingService]
})
export class GeocodingModule {}
