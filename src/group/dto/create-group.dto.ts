import { IsNotEmpty, IsString } from '@nestjs/class-validator';

export class CreateGroupDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    sport: string;

    @IsNotEmpty()
    @IsString()
    location: string;
}