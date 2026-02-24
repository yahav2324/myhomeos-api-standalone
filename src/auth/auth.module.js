var _a;
import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepoPrisma } from './auth.repo.prisma';
import { JwtStrategy } from './jwt.strategy';
import { GoogleAuthService } from './google.auth.service';
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    Module({
        imports: [
            PassportModule,
            JwtModule.register({
                secret: process.env.JWT_ACCESS_SECRET,
                signOptions: { expiresIn: Number((_a = process.env.JWT_ACCESS_TTL_SEC) !== null && _a !== void 0 ? _a : '1800') },
            }),
        ],
        controllers: [AuthController],
        providers: [AuthService, AuthRepoPrisma, JwtStrategy, GoogleAuthService],
        exports: [AuthService],
    })
], AuthModule);
export { AuthModule };
//# sourceMappingURL=auth.module.js.map