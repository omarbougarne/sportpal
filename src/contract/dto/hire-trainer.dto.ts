// src/training-contract/dto/hire-trainer.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsDate, IsNumber, Min } from '@nestjs/class-validator';
import { Type } from '@nestjs/class-transformer';

export class HireTrainerDto {
    @IsNotEmpty()
    @IsString()
    trainerId: string;

    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    startDate: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    endDate?: Date;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    totalSessions: number;

    @IsOptional()
    @IsString()
    notes?: string;
}