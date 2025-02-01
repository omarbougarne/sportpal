import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "@nestjs/class-validator";
import { Role } from '../enums/role.enum'
export class CreateUserDto {

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

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    favoriteSports: string[];

    @IsOptional()
    @IsString({ each: true })
    athleticLevel: string;

    @IsOptional()
    @IsArray()
    @IsString()
    disponsibili: string[];
}