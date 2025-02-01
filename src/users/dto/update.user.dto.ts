import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "@nestjs/class-validator";
import { Role } from '../enums/role.enum'
export class UpdateUserDto{
    
    @IsOptional()
    @IsNotEmpty()
    @IsString() 
    name: string;
    
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;
    
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

}