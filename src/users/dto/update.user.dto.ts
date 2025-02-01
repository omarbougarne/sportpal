import { isArray, IsEmail, IsArray, IsOptional, IsString, MinLength } from "@nestjs/class-validator";
import { Role } from '../enums/role.enum'
export class UpdateUserDto{
    
    @IsOptional()
    @IsString() 
    name: string;
    
    @IsOptional()
    @IsString()
    @IsEmail()
    email: string;
    
    @IsOptional()
    @IsString()
    @MinLength(6)
    password: string;

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