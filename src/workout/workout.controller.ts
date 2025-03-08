import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Logger, Request } from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { QueryWorkoutDto } from './dto/query-workout.dto';
import { JwtAuthGuard } from '../auth/common/guards/jwt-auth.guard';
import { Roles } from '../auth/common/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { RolesGuard } from '../auth/common/guards/roles.guard';

@Controller('workouts')
export class WorkoutController {
    private readonly logger = new Logger(WorkoutController.name);

    constructor(private readonly workoutService: WorkoutService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() createWorkoutDto: CreateWorkoutDto, @Request() req) {
        try {
            // Debug logging
            this.logger.log(`User from JWT token: ${JSON.stringify(req.user)}`);

            // Set the creator to the current user ID from the JWT token
            createWorkoutDto.creator = req.user.userId;

            this.logger.log(`Sending workout data: ${JSON.stringify(createWorkoutDto)}`);

            return await this.workoutService.create(createWorkoutDto);
        } catch (error) {
            this.logger.error(`Error in create workout controller: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Get()
    async findAll(@Query() queryDto: QueryWorkoutDto) {
        try {
            return await this.workoutService.findAll(queryDto);
        } catch (error) {
            this.logger.error(`Error in findAll workouts controller: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Get('my-workouts')
    @UseGuards(JwtAuthGuard)
    async findMyWorkouts(@Request() req) {
        try {
            return await this.workoutService.findByCreator(req.user.userId);
        } catch (error) {
            this.logger.error(`Error in findMyWorkouts controller: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            return await this.workoutService.findOne(id);
        } catch (error) {
            this.logger.error(`Error in findOne workout controller: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async update(@Param('id') id: string, @Body() updateWorkoutDto: UpdateWorkoutDto, @Request() req) {
        try {
            return await this.workoutService.update(id, updateWorkoutDto, req.user.userId);
        } catch (error) {
            this.logger.error(`Error in update workout controller: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: string, @Request() req) {
        try {
            return await this.workoutService.remove(id, req.user.userId);
        } catch (error) {
            this.logger.error(`Error in remove workout controller: ${error.message}`, error.stack);
            throw error;
        }
    }
}