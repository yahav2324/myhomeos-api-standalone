import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@nestjs/common';
import { HouseholdsRepoPrisma } from './households.repo.prisma';
let HouseholdsService = class HouseholdsService {
    constructor(householdsRepo) {
        this.householdsRepo = householdsRepo;
    }
    myHouseholds(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId)
                throw new Error('Missing userId (auth)');
            const rows = yield this.householdsRepo.getMyHouseholds(userId);
            return rows.map((row) => row.household);
        });
    }
    createAsOwner(userId, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId)
                throw new Error('Missing userId (auth)');
            return this.householdsRepo.createHouseholdAsOwner(userId, name);
        });
    }
};
HouseholdsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [HouseholdsRepoPrisma])
], HouseholdsService);
export { HouseholdsService };
//# sourceMappingURL=households.service.js.map