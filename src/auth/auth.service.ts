import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt'
import { CreateUSerDto } from 'src/users/dto/create.user.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ){}

    async login(email: string, password: string): Promise<any>{
        const user = await this.usersService.findUser(email);
        if(user && bcrypt.compare(password, user.password)){
            const { password, ...result } = user
            return result
        }
        return null;
    }

    async signUp(createUserDto: CreateUSerDto){
        return this.usersService.create(createUserDto)
    }
}
