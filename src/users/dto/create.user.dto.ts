import { IsEmail, IsNotEmpty, IsString, MinLength } from "@nestjs/class-validator";
import { Role } from '../enums/role.enum'
export class CreateUserDto{

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @IsNotEmpty()
    @IsString()
    role: Role;
}