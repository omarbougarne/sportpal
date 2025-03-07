import { IsString, IsNumber, IsEnum, IsArray, ValidateNested, IsMongoId, IsOptional, Min, Max, IsDateString } from '@nestjs/class-validator';
import { Type } from '@nestjs/class-transformer';
import { CertificationType } from '../enums/certification-type.enum';
import { SpecializationType } from '../enums/serialization-type.enum';

export class CertificationDto {
    @IsEnum(CertificationType)
    type: CertificationType;

    @IsString()
    name: string;

    @IsDateString()
    issueDate: Date;

    @IsOptional()
    @IsDateString()
    expiryDate?: Date;

    @IsOptional()
    @IsString()
    certificateUrl?: string;
}

export class TimeSlotDto {
    @IsNumber()
    @Min(0)
    @Max(6)
    dayOfWeek: number;

    @IsString()
    startTime: string;

    @IsString()
    endTime: string;
}

export class CreateTrainerDto {
    @IsMongoId()
    userId: string;

    @IsString()
    bio: string;

    @IsNumber()
    @Min(0)
    yearsOfExperience: number;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CertificationDto)
    certifications?: CertificationDto[];

    @IsArray()
    @IsEnum(SpecializationType, { each: true })
    specializations: SpecializationType[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TimeSlotDto)
    availability?: TimeSlotDto[];

    @IsOptional()
    @IsNumber()
    @Min(0)
    hourlyRate?: number;

    @IsOptional()
    @IsMongoId()
    location?: string;

    @IsOptional()
    @IsString()
    introVideo?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    galleryImages?: string[];
}