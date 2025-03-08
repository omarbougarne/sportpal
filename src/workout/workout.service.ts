import { Injectable, NotFoundException, Logger, HttpException, HttpStatus, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Workout, WorkoutDocument } from './schema/workout.schema';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { QueryWorkoutDto } from './dto/query-workout.dto';

@Injectable()
export class WorkoutService {
    private readonly logger = new Logger(WorkoutService.name);

    constructor(
        @InjectModel(Workout.name) private workoutModel: Model<WorkoutDocument>,
    ) { }

    async create(createWorkoutDto: CreateWorkoutDto): Promise<Workout> {
        try {
            // Add debug logging
            this.logger.log(`Creating workout with data: ${JSON.stringify(createWorkoutDto)}`);

            // Validate that creator is valid ObjectId
            if (!Types.ObjectId.isValid(createWorkoutDto.creator)) {
                throw new HttpException('Invalid creator ID', HttpStatus.BAD_REQUEST);
            }

            const createdWorkout = new this.workoutModel({
                ...createWorkoutDto,
                creator: new Types.ObjectId(createWorkoutDto.creator),
                location: createWorkoutDto.location && Types.ObjectId.isValid(createWorkoutDto.location)
                    ? new Types.ObjectId(createWorkoutDto.location)
                    : undefined,
            });

            return await createdWorkout.save();
        } catch (error) {
            this.logger.error(`Error creating workout: ${error.message}`, error.stack);
            throw new HttpException(`Error creating workout: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAll(queryDto: QueryWorkoutDto): Promise<{ workouts: Workout[], total: number }> {
        try {
            const {
                title,
                workoutType,
                difficultyLevel,
                minDuration,
                maxDuration,
                tag,
                equipment,
                creator,
                limit = 20,
                skip = 0,
            } = queryDto;

            const query: any = {};

            if (title) {
                query.title = { $regex: title, $options: 'i' };
            }

            if (workoutType) {
                query.workoutType = workoutType;
            }

            if (difficultyLevel) {
                query.difficultyLevel = difficultyLevel;
            }

            if (minDuration !== undefined || maxDuration !== undefined) {
                query.duration = {};
                if (minDuration !== undefined) {
                    query.duration.$gte = minDuration;
                }
                if (maxDuration !== undefined) {
                    query.duration.$lte = maxDuration;
                }
            }

            if (tag) {
                query.tags = tag;
            }

            if (equipment) {
                query.equipment = equipment;
            }

            if (creator) {
                query.creator = new Types.ObjectId(creator);
            }

            const total = await this.workoutModel.countDocuments(query);
            const workouts = await this.workoutModel
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec();

            return { workouts, total };
        } catch (error) {
            this.logger.error(`Error finding workouts: ${error.message}`, error.stack);
            throw new HttpException('Error finding workouts', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findByCreator(userId: string): Promise<Workout[]> {
        try {
            return await this.workoutModel
                .find({ creator: new Types.ObjectId(userId) })
                .sort({ createdAt: -1 })
                .exec();
        } catch (error) {
            this.logger.error(`Error finding creator's workouts: ${error.message}`, error.stack);
            throw new HttpException('Error finding creator\'s workouts', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOne(id: string): Promise<Workout> {
        try {
            const workout = await this.workoutModel.findById(id).exec();
            if (!workout) {
                throw new NotFoundException(`Workout with ID ${id} not found`);
            }
            return workout;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Error finding workout: ${error.message}`, error.stack);
            throw new HttpException('Error finding workout', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async update(id: string, updateWorkoutDto: UpdateWorkoutDto, userId: string): Promise<Workout> {
        try {
            // First check if the workout exists and belongs to this user
            const workout = await this.workoutModel.findById(id);
            if (!workout) {
                throw new NotFoundException(`Workout with ID ${id} not found`);
            }

            // Check if the user is the creator
            if (workout.creator.toString() !== userId) {
                throw new ForbiddenException('You can only update your own workouts');
            }

            // Convert string IDs to ObjectIds if present
            if (updateWorkoutDto.creator) {
                updateWorkoutDto.creator = new Types.ObjectId(updateWorkoutDto.creator) as any;
            }
            if (updateWorkoutDto.location) {
                updateWorkoutDto.location = new Types.ObjectId(updateWorkoutDto.location) as any;
            }

            const updatedWorkout = await this.workoutModel
                .findByIdAndUpdate(id, updateWorkoutDto, { new: true })
                .exec();

            return updatedWorkout;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ForbiddenException) {
                throw error;
            }
            this.logger.error(`Error updating workout: ${error.message}`, error.stack);
            throw new HttpException('Error updating workout', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async remove(id: string, userId: string): Promise<Workout> {
        try {
            // First check if the workout exists and belongs to this user
            const workout = await this.workoutModel.findById(id);
            if (!workout) {
                throw new NotFoundException(`Workout with ID ${id} not found`);
            }

            // Check if the user is the creator
            if (workout.creator.toString() !== userId) {
                throw new ForbiddenException('You can only delete your own workouts');
            }

            const deletedWorkout = await this.workoutModel.findByIdAndDelete(id).exec();
            return deletedWorkout;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ForbiddenException) {
                throw error;
            }
            this.logger.error(`Error removing workout: ${error.message}`, error.stack);
            throw new HttpException('Error removing workout', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
