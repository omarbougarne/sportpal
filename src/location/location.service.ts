import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Location, LocationDocument } from './schema/location.schema';
import { GeocodingService } from '../geocoding/geocoding.service';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationService {
    constructor(
        @InjectModel(Location.name) private locationModel: Model<LocationDocument>,
        private readonly geocodingService: GeocodingService,
    ) { }

    async createLocation(createLocationDto: CreateLocationDto): Promise<Location> {
        try {
            // Combine address components for geocoding
            const addressToGeocode = [
                createLocationDto.address,
                createLocationDto.district,
                createLocationDto.city,
                createLocationDto.country,
            ]
                .filter(Boolean)
                .join(', ');

            // Convert address to coordinates
            const { longitude, latitude } = await this.geocodingService.geocode(addressToGeocode);

            const location = new this.locationModel({
                ...createLocationDto,
                location: {
                    type: 'Point',
                    coordinates: [longitude, latitude],
                },
            });

            return await location.save();
        } catch (error) {
            throw new HttpException('Error creating location', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findNearby(latitude: number, longitude: number, maxDistance: number = 5000): Promise<Location[]> {
        try {
            // Find locations within maxDistance meters
            return this.locationModel.find({
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [longitude, latitude],
                        },
                        $maxDistance: maxDistance,
                    },
                },
            }).exec();
        } catch (error) {
            throw new HttpException('Error finding nearby locations', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findByName(name: string): Promise<Location[]> {
        try {
            return this.locationModel.find({
                name: { $regex: name, $options: 'i' }
            }).exec();
        } catch (error) {
            throw new HttpException('Error finding locations by name', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
