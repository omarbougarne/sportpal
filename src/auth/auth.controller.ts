import { Controller, Post, Body, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUSerDto } from 'src/users/dto/create.user.dto';


@Controller('auth')
export class AuthController {
    constructor( private authService: AuthService ){}
    
    @Post('signup')
        async signup(@Body() createUserDto: CreateUSerDto){
            return this.authService.signUp(createUserDto);
        }
    @Post('/login')
    async login(@Request() req){
        return this.authService.login(req.user)
    }
}
