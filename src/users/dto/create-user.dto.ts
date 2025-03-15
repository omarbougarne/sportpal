import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "@nestjs/class-validator";
import { Role } from '../enums/role.enum';
import { Level } from '../enums/level.enum';
import { Availability } from '../enums/availability.enum';
import { AccountStatus } from '../enums/account-status.enum';
import { GeoPoint } from '../types/geo-point.type';

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

    @IsOptional()
    @IsString()
    profileImageUrl?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    favoriteSports?: string[];

    @IsOptional()
    @IsEnum(Level)
    level?: Level;

    @IsOptional()
    @IsEnum(Availability)
    availability?: Availability;

    @IsOptional()
    location?: GeoPoint;

    @IsNotEmpty()
    @IsEnum(Role)
    role: Role;

    @IsOptional()
    preferences?: Record<string, any>;

    @IsOptional()
    contactInfo?: Record<string, any>;

    @IsOptional()
    @IsEnum(AccountStatus)
    accountStatus?: AccountStatus;
}