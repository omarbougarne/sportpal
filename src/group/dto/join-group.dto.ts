import { IsNotEmpty, IsOptional, IsString } from '@nestjs/class-validator';

export class JoinGroupDto {

    @IsNotEmpty()
    @IsString()
    groupId: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    userId: string;

}