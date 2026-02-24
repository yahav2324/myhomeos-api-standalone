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
exports.HouseholdsService = void 0;
const common_1 = require("@nestjs/common");
const households_repo_prisma_1 = require("./households.repo.prisma");
let HouseholdsService = class HouseholdsService {
    constructor(householdsRepo) {
        this.householdsRepo = householdsRepo;
    }
    async myHouseholds(userId) {
        if (!userId)
            throw new Error('Missing userId (auth)');
        const rows = await this.householdsRepo.getMyHouseholds(userId);
        return rows.map((row) => row.household);
    }
    async createAsOwner(userId, name) {
        if (!userId)
            throw new Error('Missing userId (auth)');
        return this.householdsRepo.createHouseholdAsOwner(userId, name);
    }
};
exports.HouseholdsService = HouseholdsService;
exports.HouseholdsService = HouseholdsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [households_repo_prisma_1.HouseholdsRepoPrisma])
], HouseholdsService);
//# sourceMappingURL=households.service.js.map