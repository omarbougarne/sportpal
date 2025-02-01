import { IsNotEmpty, IsOptional, IsString } from '@nestjs/class-validator';

export class CreateGroupDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    sport: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    activity: string;

    @IsNotEmpty()
    @IsString()
    location: string;
}