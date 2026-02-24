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
exports.HouseholdsRepoPrisma = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let HouseholdsRepoPrisma = class HouseholdsRepoPrisma {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMyHouseholds(userId) {
        return this.prisma.householdMember.findMany({
            where: { userId, status: client_1.MemberStatus.ACTIVE },
            include: { household: true },
        });
    }
    async createHouseholdAsOwner(userId, name) {
        return this.prisma.$transaction(async (tx) => {
            const household = await tx.household.create({ data: { name } });
            await tx.householdMember.create({
                data: {
                    role: 'OWNER',
                    status: 'ACTIVE',
                    user: { connect: { id: userId } },
                    household: { connect: { id: household.id } },
                },
            });
            await tx.user.update({
                where: { id: userId },
                data: { activeHouseholdId: household.id },
            });
            return household;
        });
    }
};
exports.HouseholdsRepoPrisma = HouseholdsRepoPrisma;
exports.HouseholdsRepoPrisma = HouseholdsRepoPrisma = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HouseholdsRepoPrisma);
//# sourceMappingURL=households.repo.prisma.js.map