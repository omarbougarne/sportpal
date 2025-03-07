import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeocodingService {
    private apiKey: string;

    constructor(private configService: ConfigService) {
        this.apiKey = this.configService.get<string>('MAPBOX_API_KEY');
    }

    async geocode(place: string): Promise<{ longitude: number; latitude: number }> {
        try {
            // Using Mapbox geocoding API (you can replace with Google Maps or other providers)
            const response = await axios.get(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(place)}.json`,
                {
                    params: {
                        access_token: this.apiKey,
                        limit: 1,
                    },
                }
            );

            if (response.data.features.length === 0) {
                throw new HttpException('Location not found', HttpStatus.NOT_FOUND);
            }

            const [longitude, latitude] = response.data.features[0].center;
            return { longitude, latitude };
        } catch (error) {
            throw new HttpException('Geocoding service error', HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
}
