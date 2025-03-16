import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/schema/users.schema';
import { Model } from 'mongoose';
import { UsersService } from 'src/users/users.service';
@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService,
        private usersService: UsersService

    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        try {
            const payload = this.jwtService.verify(token);

            request.user = payload;

            return true;
        } catch (error) {
            console.error('Token verification error:', error);
            throw new UnauthorizedException('Invalid token');
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const authHeader = request.headers.authorization;
        if (!authHeader) return undefined;

        const [type, token] = authHeader.split(' ');
        return type === 'Bearer' ? token : undefined;
    }
}