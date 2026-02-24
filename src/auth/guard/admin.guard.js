import { __awaiter, __decorate, __metadata } from "tslib";
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
let AdminGuard = class AdminGuard {
    constructor(prisma) {
        this.prisma = prisma;
    }
    canActivate(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const req = ctx.switchToHttp().getRequest();
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // חייב ש-JwtAuthGuard ישים לפחות id
            if (!userId)
                throw new ForbiddenException('Forbidden');
            const u = yield this.prisma.user.findUnique({
                where: { id: userId },
                select: { isAdmin: true },
            });
            if (!(u === null || u === void 0 ? void 0 : u.isAdmin))
                throw new ForbiddenException('Admin only');
            return true;
        });
    }
};
AdminGuard = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], AdminGuard);
export { AdminGuard };
//# sourceMappingURL=admin.guard.js.map