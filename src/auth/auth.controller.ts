import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create.user.dto';


@Controller('auth')
export class AuthController {
    constructor( private authService: AuthService ){}
    
    @Post('signup')
        async signup(@Body() createUserDto: CreateUserDto){
            return this.authService.signUp(createUserDto);
        }
    @Post('login')
    async login(@Body() createUSerDto: CreateUserDto){
        return this.authService.login(createUSerDto.email, createUSerDto.password)
    }
}
