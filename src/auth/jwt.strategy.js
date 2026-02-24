import { __awaiter, __decorate, __metadata } from "tslib";
// apps/api/src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
let JwtStrategy = class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(prisma) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_ACCESS_SECRET,
        });
        this.prisma = prisma;
    }
    validate(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const user = yield this.prisma.user.findUnique({
                where: { id: payload.sub },
                select: { id: true, activeHouseholdId: true },
            });
            if (!user)
                throw new UnauthorizedException();
            return {
                id: user.id,
                activeHouseholdId: (_a = user.activeHouseholdId) !== null && _a !== void 0 ? _a : null,
            };
        });
    }
};
JwtStrategy = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], JwtStrategy);
export { JwtStrategy };
//# sourceMappingURL=jwt.strategy.js.map