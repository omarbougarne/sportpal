import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserDocument } from 'src/users/schema/users.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async signUp(createUserDto: CreateUserDto): Promise<UserDocument> {
        const user = await this.usersService.create(createUserDto);
        return user;
    }

    async login(email: string, password: string): Promise<{ access_token: string }> {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(password, user.password)) {
            const accessToken = this.generateToken(user);
            return { access_token: accessToken };
        }
        throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);
    }

    // ✅ Correct payload
    private generateToken(user: UserDocument): string {
        const payload = { sub: user._id.toString() }; // sub = standardized JWT field for user ID
        return this.jwtService.sign(payload);
    }
}
