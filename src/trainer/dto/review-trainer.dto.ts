import { IsString, IsNumber, IsMongoId, IsOptional, Min, Max } from '@nestjs/class-validator';

export class ReviewTrainerDto {
    @IsMongoId()
    userId: string;

    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;

    @IsOptional()
    @IsString()
    comment?: string;
}