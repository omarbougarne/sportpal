import { Controller, Post, Get, Body, Query, Param, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';

@Controller('locations')
export class LocationController {
    constructor(private readonly locationService: LocationService) { }

    // Add this new method to match your frontend API call
    @Get(':id')
    async getLocationById(@Param('id') id: string) {
        try {
            const location = await this.locationService.getLocationById(id);
            if (!location) {
                throw new NotFoundException(`Location with ID ${id} not found`);
            }
            return location;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new HttpException('Error fetching location', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post()
    async createLocation(@Body() createLocationDto: CreateLocationDto) {
        return this.locationService.createLocation(createLocationDto);
    }

    @Get('nearby')
    async findNearby(
        @Query('lat') latitude: number,
        @Query('lng') longitude: number,
        @Query('distance') distance: number,
    ) {
        return this.locationService.findNearby(latitude, longitude, distance);
    }

    @Get('search/:name')
    async findByName(@Param('name') name: string) {
        return this.locationService.findByName(name);
    }
}