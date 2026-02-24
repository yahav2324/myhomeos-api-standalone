import { __awaiter, __decorate, __metadata, __param } from "tslib";
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateHouseholdSchema } from "../../internal-libs/contracts/src/index";
import { parseOrThrow } from '../common/zod';
import { HouseholdsService } from './households.service';
import { CurrentUserId } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt.guard';
let HouseholdsController = class HouseholdsController {
    constructor(service) {
        this.service = service;
    }
    me(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.service.myHouseholds(userId);
        });
    }
    create(userId, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const dto = parseOrThrow(CreateHouseholdSchema, body);
            return this.service.createAsOwner(userId, dto.name);
        });
    }
};
__decorate([
    Get('me'),
    __param(0, CurrentUserId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HouseholdsController.prototype, "me", null);
__decorate([
    Post(),
    __param(0, CurrentUserId()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], HouseholdsController.prototype, "create", null);
HouseholdsController = __decorate([
    UseGuards(JwtAuthGuard),
    Controller('households'),
    __metadata("design:paramtypes", [HouseholdsService])
], HouseholdsController);
export { HouseholdsController };
//# sourceMappingURL=households.controller.js.map