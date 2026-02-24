"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveHouseholdGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ActiveHouseholdGuard = class ActiveHouseholdGuard {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(ctx) {
        const req = ctx.switchToHttp().getRequest();
        const userId = req.user?.sub ?? req.user?.id;
        if (!userId)
            throw new common_1.ForbiddenException('Not authenticated');
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { activeHouseholdId: true },
        });
        const householdId = user?.activeHouseholdId;
        if (!householdId)
            throw new common_1.ForbiddenException('No active household. Complete onboarding.');
        req.householdId = householdId;
        return true;
    }
};
exports.ActiveHouseholdGuard = ActiveHouseholdGuard;
exports.ActiveHouseholdGuard = ActiveHouseholdGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActiveHouseholdGuard);
//# sourceMappingURL=active-household.guard.js.map