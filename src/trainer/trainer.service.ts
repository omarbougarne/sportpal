import { Injectable, NotFoundException, ConflictException, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Trainer, TrainerDocument } from './schema/tariner.schema';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { ReviewTrainerDto } from './dto/review-trainer.dto';
import { QueryTrainerDto } from './dto/query-trainer.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class TrainerService {
    private readonly logger = new Logger(TrainerService.name);

    constructor(
        @InjectModel(Trainer.name) private trainerModel: Model<TrainerDocument>,
        private readonly usersService: UsersService,
    ) { }

    async create(createTrainerDto: CreateTrainerDto): Promise<Trainer> {
        try {
            // Check if user exists
            const user = await this.usersService.findOne(createTrainerDto.userId);
            if (!user) {
                throw new NotFoundException(`User with ID ${createTrainerDto.userId} not found`);
            }

            // Check if trainer profile already exists for this user
            const existingTrainer = await this.trainerModel.findOne({ userId: createTrainerDto.userId }).exec();
            if (existingTrainer) {
                throw new ConflictException(`Trainer profile already exists for user ${createTrainerDto.userId}`);
            }

            // Create trainer profile
            const createdTrainer = new this.trainerModel({
                ...createTrainerDto,
                userId: new Types.ObjectId(createTrainerDto.userId),
                location: createTrainerDto.location ? new Types.ObjectId(createTrainerDto.location) : undefined,
                averageRating: 0,
                reviews: [],
                workouts: [],
            });

            return await createdTrainer.save();
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            this.logger.error(`Error creating trainer: ${error.message}`, error.stack);
            throw new HttpException('Error creating trainer profile', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAll(queryDto: QueryTrainerDto): Promise<{ trainers: Trainer[], total: number }> {
        try {
            const {
                specialization,
                minExperience,
                maxRate,
                minRating,
                location,
                searchTerm,
                limit = 20,
                skip = 0,
            } = queryDto;

            const query: any = {};

            if (specialization) {
                query.specializations = specialization;
            }

            if (minExperience !== undefined) {
                query.yearsOfExperience = { $gte: minExperience };
            }

            if (maxRate !== undefined) {
                query.hourlyRate = { $lte: maxRate };
            }

            if (minRating !== undefined) {
                query.averageRating = { $gte: minRating };
            }

            if (location) {
                query.location = new Types.ObjectId(location);
            }

            if (searchTerm) {
                // This requires a join with users collection to search by name
                // You would need to implement an aggregation pipeline for this
                // For now, we'll skip this part and search only within trainer fields
            }

            const total = await this.trainerModel.countDocuments(query);
            const trainers = await this.trainerModel
                .find(query)
                .populate('userId', 'name email profileImageUrl')
                .sort({ averageRating: -1, yearsOfExperience: -1 })
                .skip(skip)
                .limit(limit)
                .exec();

            return { trainers, total };
        } catch (error) {
            this.logger.error(`Error finding trainers: ${error.message}`, error.stack);
            throw new HttpException('Error finding trainers', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOne(id: string): Promise<Trainer> {
        try {
            const trainer = await this.trainerModel
                .findById(id)
                .populate('userId', 'name email profileImageUrl')
                .populate('workouts')
                .populate('location')
                .exec();

            if (!trainer) {
                throw new NotFoundException(`Trainer with ID ${id} not found`);
            }

            return trainer;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Error finding trainer: ${error.message}`, error.stack);
            throw new HttpException('Error finding trainer', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findByUserId(userId: string): Promise<Trainer> {
        try {
            const trainer = await this.trainerModel
                .findOne({ userId: new Types.ObjectId(userId) })
                .populate('userId', 'name email profileImageUrl')
                .populate('workouts')
                .populate('location')
                .exec();

            if (!trainer) {
                throw new NotFoundException(`Trainer profile for user ${userId} not found`);
            }

            return trainer;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Error finding trainer by userId: ${error.message}`, error.stack);
            throw new HttpException('Error finding trainer profile', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async update(id: string, updateTrainerDto: UpdateTrainerDto): Promise<Trainer> {
        try {
            // Handle ObjectId conversions
            if (updateTrainerDto.location) {
                updateTrainerDto.location = new Types.ObjectId(updateTrainerDto.location) as any;
            }

            const updatedTrainer = await this.trainerModel
                .findByIdAndUpdate(id, updateTrainerDto, { new: true })
                .exec();

            if (!updatedTrainer) {
                throw new NotFoundException(`Trainer with ID ${id} not found`);
            }

            return updatedTrainer;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Error updating trainer: ${error.message}`, error.stack);
            throw new HttpException('Error updating trainer profile', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async remove(id: string): Promise<Trainer> {
        try {
            const deletedTrainer = await this.trainerModel.findByIdAndDelete(id).exec();
            if (!deletedTrainer) {
                throw new NotFoundException(`Trainer with ID ${id} not found`);
            }
            return deletedTrainer;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Error removing trainer: ${error.message}`, error.stack);
            throw new HttpException('Error removing trainer profile', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addReview(id: string, reviewDto: ReviewTrainerDto): Promise<Trainer> {
        try {
            const trainer = await this.trainerModel.findById(id).exec();
            if (!trainer) {
                throw new NotFoundException(`Trainer with ID ${id} not found`);
            }

            // Check if user has already reviewed this trainer
            const existingReviewIndex = trainer.reviews.findIndex(
                review => review.userId.toString() === reviewDto.userId
            );

            if (existingReviewIndex !== -1) {
                // Update existing review
                trainer.reviews[existingReviewIndex] = {
                    userId: new Types.ObjectId(reviewDto.userId),
                    rating: reviewDto.rating,
                    comment: reviewDto.comment,
                    createdAt: new Date(),
                };
            } else {
                // Add new review
                trainer.reviews.push({
                    userId: new Types.ObjectId(reviewDto.userId),
                    rating: reviewDto.rating,
                    comment: reviewDto.comment,
                    createdAt: new Date(),
                });
            }

            // Calculate new average rating
            if (trainer.reviews.length > 0) {
                const totalRating = trainer.reviews.reduce((sum, review) => sum + review.rating, 0);
                trainer.averageRating = totalRating / trainer.reviews.length;
            } else {
                trainer.averageRating = 0;
            }

            return await trainer.save();
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Error adding review: ${error.message}`, error.stack);
            throw new HttpException('Error adding review', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addWorkout(id: string, workoutId: string): Promise<Trainer> {
        try {
            const trainer = await this.trainerModel.findById(id).exec();
            if (!trainer) {
                throw new NotFoundException(`Trainer with ID ${id} not found`);
            }

            const workoutObjectId = new Types.ObjectId(workoutId);
            if (!trainer.workouts.includes(workoutObjectId)) {
                trainer.workouts.push(workoutObjectId);
                await trainer.save();
            }

            return trainer;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Error adding workout to trainer: ${error.message}`, error.stack);
            throw new HttpException('Error adding workout to trainer', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}