import { Controller, Post, Get, Body, Query, Param } from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';

@Controller('locations')
export class LocationController {
    constructor(private readonly locationService: LocationService) { }

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