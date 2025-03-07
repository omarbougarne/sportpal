import { IsString, IsEnum, IsOptional, IsNumber, Min, Max, IsMongoId } from '@nestjs/class-validator';
import { Type } from '@nestjs/class-transformer';
import { WorkoutType } from '../enums/workout-type.enum';
import { DifficultyLevel } from '../enums/difficulty-level.enum';

export class QueryWorkoutDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsEnum(WorkoutType)
    workoutType?: WorkoutType;

    @IsOptional()
    @IsEnum(DifficultyLevel)
    difficultyLevel?: DifficultyLevel;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minDuration?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxDuration?: number;

    @IsOptional()
    @IsString()
    tag?: string;

    @IsOptional()
    @IsString()
    equipment?: string;

    @IsOptional()
    @IsMongoId()
    creator?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    skip?: number = 0;
}