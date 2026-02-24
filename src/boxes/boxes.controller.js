import { __awaiter, __decorate, __metadata, __param } from "tslib";
import { Body, Controller, Delete, Get, Param, Patch, Post, BadRequestException, UseGuards, } from '@nestjs/common';
import { BoxesService } from './boxes.service';
import { z } from 'zod';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ActiveHouseholdGuard } from '../auth/active-household.guard';
import { ActiveHouseholdId } from '../auth/active-household.decorator';
const UuidSchema = z.string().uuid();
let BoxesController = class BoxesController {
    constructor(service) {
        this.service = service;
    }
    create(householdId, body) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.service.create(householdId, body);
        });
    }
    list(householdId) {
        return __awaiter(this, void 0, void 0, function* () {
            return { ok: true, data: yield this.service.findAllForHousehold(householdId) };
        });
    }
    get(householdId, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return { ok: true, data: yield this.service.getForHousehold(householdId, id) };
        });
    }
    identify(householdId, id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.service.identifyBox(householdId, id);
            return { ok: true, data: { id, action: 'IDENTIFY' } };
        });
    }
    setFull(householdId, id, body) {
        const ok = UuidSchema.safeParse(id);
        if (!ok.success) {
            throw new BadRequestException('Invalid id (expected UUID). Use /by-code/:code/* for code.');
        }
        return this.service.setFullForHousehold(householdId, id, body);
    }
    recalibrateFull(householdId, id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.service.recalibrateFullForHousehold(householdId, id, body);
        });
    }
    delete(householdId, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.service.deleteBoxForHousehold(householdId, id);
        });
    }
    setFullByCode(householdId, code, body) {
        return this.service.setFullByCodeForHousehold(householdId, code, body);
    }
};
__decorate([
    Post(),
    __param(0, ActiveHouseholdId()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BoxesController.prototype, "create", null);
__decorate([
    Get(),
    __param(0, ActiveHouseholdId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BoxesController.prototype, "list", null);
__decorate([
    Get(':id'),
    __param(0, ActiveHouseholdId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BoxesController.prototype, "get", null);
__decorate([
    Post(':id/identify'),
    __param(0, ActiveHouseholdId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BoxesController.prototype, "identify", null);
__decorate([
    Patch(':id/set-full'),
    __param(0, ActiveHouseholdId()),
    __param(1, Param('id')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], BoxesController.prototype, "setFull", null);
__decorate([
    Post(':id/recalibrate-full'),
    __param(0, ActiveHouseholdId()),
    __param(1, Param('id')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], BoxesController.prototype, "recalibrateFull", null);
__decorate([
    Delete(':id'),
    __param(0, ActiveHouseholdId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BoxesController.prototype, "delete", null);
__decorate([
    Patch('by-code/:code/set-full'),
    __param(0, ActiveHouseholdId()),
    __param(1, Param('code')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], BoxesController.prototype, "setFullByCode", null);
BoxesController = __decorate([
    UseGuards(JwtAuthGuard, ActiveHouseholdGuard),
    Controller('boxes'),
    __metadata("design:paramtypes", [BoxesService])
], BoxesController);
export { BoxesController };
//# sourceMappingURL=boxes.controller.js.map