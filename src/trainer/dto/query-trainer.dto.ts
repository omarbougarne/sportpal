import { IsString, IsEnum, IsOptional, IsNumber, Min, Max } from '@nestjs/class-validator';
import { Type } from '@nestjs/class-transformer';
import { SpecializationType } from '../enums/serialization-type.enum';

export class QueryTrainerDto {
    @IsOptional()
    @IsEnum(SpecializationType)
    specialization?: SpecializationType;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minExperience?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxRate?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(5)
    minRating?: number;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    searchTerm?: string;

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