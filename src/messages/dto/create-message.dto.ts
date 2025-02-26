import { IsNotEmpty, IsString } from '@nestjs/class-validator';

export class CreateMessageDto {
    @IsNotEmpty()
    @IsString()
    groupId: string;

    @IsNotEmpty()
    @IsString()
    senderId: string;

    @IsNotEmpty()
    @IsString()
    content: string;
}