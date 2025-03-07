import { IsString, IsNumber, IsArray, IsOptional, Min } from '@nestjs/class-validator';

export class ExerciseDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    sets?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    reps?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    duration?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    restTime?: number;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    imageUrls?: string[];
}