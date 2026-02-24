import { __awaiter, __decorate, __metadata } from "tslib";
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
let ActiveHouseholdGuard = class ActiveHouseholdGuard {
    constructor(prisma) {
        this.prisma = prisma;
    }
    canActivate(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const req = ctx.switchToHttp().getRequest();
            const userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
            if (!userId)
                throw new ForbiddenException('Not authenticated');
            const user = yield this.prisma.user.findUnique({
                where: { id: userId },
                select: { activeHouseholdId: true },
            });
            const householdId = user === null || user === void 0 ? void 0 : user.activeHouseholdId;
            if (!householdId)
                throw new ForbiddenException('No active household. Complete onboarding.');
            req.householdId = householdId;
            return true;
        });
    }
};
ActiveHouseholdGuard = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], ActiveHouseholdGuard);
export { ActiveHouseholdGuard };
//# sourceMappingURL=active-household.guard.js.map