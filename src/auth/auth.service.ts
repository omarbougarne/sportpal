import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create.user.dto';
import { User } from 'src/users/schema/users.schema';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async signUp(createUserDto: CreateUserDto): Promise<{ data: User }> {
        const { data: user } = await this.usersService.create(createUserDto)
        return { data: user };
    }

    async login(email: string, password: string): Promise<{ data: { access_token: String } }> {
        const { data: user } = await this.usersService.findByEmail(email);
        if (user && bcrypt.compare(password, user.password)) {
            const accesToken = this.generateToken(user)
            return { data: { access_token: accesToken } };
        }
        throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED)

    }


    private generateToken(user: User): String {
        const payload = { email: user.email, password: user.password }
        return this.jwtService.sign(payload)
    }
}
