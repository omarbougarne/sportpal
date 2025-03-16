import {
    Controller, Get, Post, Body, Patch, Param, Delete,
    Query, UseGuards, Logger, Request
} from '@nestjs/common';
import { TrainerService } from './trainer.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { ReviewTrainerDto } from './dto/review-trainer.dto';
import { QueryTrainerDto } from './dto/query-trainer.dto';
import { JwtAuthGuard } from '../auth/common/guards/jwt-auth.guard';
// import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
// import { RolesGuard } from '../common/guards/roles.guard';

@Controller('trainers')
export class TrainerController {
    private readonly logger = new Logger(TrainerController.name);

    constructor(private readonly trainerService: TrainerService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() createTrainerDto: CreateTrainerDto, @Request() req) {
        try {
            // Ensure the user is creating their own profile
            if (createTrainerDto.userId !== req.user.userId) {
                createTrainerDto.userId = req.user.userId;
            }
            return await this.trainerService.create(createTrainerDto);
        } catch (error) {
            this.logger.error(`Error in create trainer controller: ${error.message}`, error.stack);
            throw error;
        }
    }
    @Post('become-trainer')
    @UseGuards(JwtAuthGuard)
    async becomeTrainer(
        @Request() req,
        @Body() createTrainerDto: CreateTrainerDto
    ) {
        try {
            // Call the service method with user ID from JWT token
            return await this.trainerService.becomeTrainer(
                req.user.userId,
                createTrainerDto
            );
        } catch (error) {
            this.logger.error(`Error in becomeTrainer controller: ${error.message}`, error.stack);
            throw error;
        }
    }
    // @Post()
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(Role.ADMIN)
    // async create(@Body() createTrainerDto: CreateTrainerDto) {
    //     return this.trainerService.create(createTrainerDto);
    // }
    @Get()
    async findAll(@Query() queryDto: QueryTrainerDto) {
        try {
            return await this.trainerService.findAll(queryDto);
        } catch (error) {
            this.logger.error(`Error in findAll trainers controller: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getMyProfile(@Request() req) {
        try {
            return await this.trainerService.findByUserId(req.user.userId);
        } catch (error) {
            this.logger.error(`Error in getMyProfile controller: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            return await this.trainerService.findOne(id);
        } catch (error) {
            this.logger.error(`Error in findOne trainer controller: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Get('user/:userId')
    async findByUserId(@Param('userId') userId: string) {
        try {
            return await this.trainerService.findByUserId(userId);
        } catch (error) {
            this.logger.error(`Error in findByUserId controller: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async update(@Param('id') id: string, @Body() updateTrainerDto: UpdateTrainerDto, @Request() req) {
        try {
            // Verify that the trainer belongs to the current user
            const trainer = await this.trainerService.findOne(id);
            if (trainer.userId.toString() !== req.user.userId) {
                throw new Error('You can only update your own trainer profile');
            }
            return await this.trainerService.update(id, updateTrainerDto);
        } catch (error) {
            this.logger.error(`Error in update trainer controller: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: string, @Request() req) {
        try {
            // Admin can delete any profile, users can only delete their own
            if (!req.user.roles.includes(Role.Admin)) {
                const trainer = await this.trainerService.findOne(id);
                if (trainer.userId.toString() !== req.user.userId) {
                    throw new Error('You can only delete your own trainer profile');
                }
            }
            return await this.trainerService.remove(id);
        } catch (error) {
            this.logger.error(`Error in remove trainer controller: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Post(':id/review')
    @UseGuards(JwtAuthGuard)
    async addReview(
        @Param('id') id: string,
        @Body() reviewDto: ReviewTrainerDto,
        @Request() req
    ) {
        try {
            // Set the user ID from the JWT token
            reviewDto.userId = req.user.userId;
            return await this.trainerService.addReview(id, reviewDto);
        } catch (error) {
            this.logger.error(`Error in addReview controller: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Post(':id/workouts/:workoutId')
    @UseGuards(JwtAuthGuard)
    async addWorkout(
        @Param('id') id: string,
        @Param('workoutId') workoutId: string,
        @Request() req
    ) {
        try {
            // Verify that the trainer belongs to the current user
            const trainer = await this.trainerService.findOne(id);
            if (trainer.userId.toString() !== req.user.userId) {
                throw new Error('You can only add workouts to your own trainer profile');
            }
            return await this.trainerService.addWorkout(id, workoutId);
        } catch (error) {
            this.logger.error(`Error in addWorkout controller: ${error.message}`, error.stack);
            throw error;
        }
    }
}