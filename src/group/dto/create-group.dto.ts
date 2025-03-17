import { IsNotEmpty, IsOptional, IsString } from '@nestjs/class-validator';

export class CreateGroupDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    sport?: string;

    @IsOptional()
    @IsString()
    activity?: string;

    @IsNotEmpty()
    @IsString()
    location: string;


    // @IsNotEmpty()
    // @IsString()
    // organizer: string;
}