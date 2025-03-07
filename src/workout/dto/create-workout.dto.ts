import { IsString, IsEnum, IsNumber, IsArray, ValidateNested, IsMongoId, IsOptional, Min } from '@nestjs/class-validator';
import { Type } from '@nestjs/class-transformer';
import { WorkoutType } from '../enums/workout-type.enum';
import { DifficultyLevel } from '../enums/difficulty-level.enum';
import { ExerciseDto } from './exercise.dto';

export class CreateWorkoutDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(WorkoutType)
    workoutType: WorkoutType;

    @IsEnum(DifficultyLevel)
    difficultyLevel: DifficultyLevel;

    @IsNumber()
    @Min(0)
    duration: number;

    @IsNumber()
    @Min(0)
    caloriesBurn: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ExerciseDto)
    exercises: ExerciseDto[];

    @IsMongoId()
    creator: string;

    @IsMongoId()
    @IsOptional()
    location?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    equipment?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    imageUrls?: string[];
}