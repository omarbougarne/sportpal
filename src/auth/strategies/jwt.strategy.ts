import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        const secret = configService.get<string>('JWT_SECRET');
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        })
    }
    // ✅ Correct
    async validate(payload: any) {
        return {
            userId: payload.sub, // Matches the "sub" field in the JWT

            email: payload.email
        };
    }
}