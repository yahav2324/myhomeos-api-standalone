import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MemberStatus } from '@prisma/client';
let HouseholdsRepoPrisma = class HouseholdsRepoPrisma {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getMyHouseholds(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.householdMember.findMany({
                where: { userId, status: MemberStatus.ACTIVE },
                include: { household: true },
            });
        });
    }
    createHouseholdAsOwner(userId, name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const household = yield tx.household.create({ data: { name } });
                yield tx.householdMember.create({
                    data: {
                        role: 'OWNER',
                        status: 'ACTIVE',
                        user: { connect: { id: userId } },
                        household: { connect: { id: household.id } },
                    },
                });
                yield tx.user.update({
                    where: { id: userId },
                    data: { activeHouseholdId: household.id },
                });
                return household;
            }));
        });
    }
};
HouseholdsRepoPrisma = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], HouseholdsRepoPrisma);
export { HouseholdsRepoPrisma };
//# sourceMappingURL=households.repo.prisma.js.map