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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoxesController = void 0;
const common_1 = require("@nestjs/common");
const boxes_service_1 = require("./boxes.service");
const zod_1 = require("zod");
const jwt_guard_1 = require("../auth/jwt.guard");
const active_household_guard_1 = require("../auth/active-household.guard");
const active_household_decorator_1 = require("../auth/active-household.decorator");
const UuidSchema = zod_1.z.string().uuid();
let BoxesController = class BoxesController {
    constructor(service) {
        this.service = service;
    }
    async create(householdId, body) {
        return this.service.create(householdId, body);
    }
    async list(householdId) {
        return { ok: true, data: await this.service.findAllForHousehold(householdId) };
    }
    async get(householdId, id) {
        return { ok: true, data: await this.service.getForHousehold(householdId, id) };
    }
    async identify(householdId, id) {
        await this.service.identifyBox(householdId, id);
        return { ok: true, data: { id, action: 'IDENTIFY' } };
    }
    setFull(householdId, id, body) {
        const ok = UuidSchema.safeParse(id);
        if (!ok.success) {
            throw new common_1.BadRequestException('Invalid id (expected UUID). Use /by-code/:code/* for code.');
        }
        return this.service.setFullForHousehold(householdId, id, body);
    }
    async recalibrateFull(householdId, id, body) {
        return this.service.recalibrateFullForHousehold(householdId, id, body);
    }
    async delete(householdId, id) {
        return this.service.deleteBoxForHousehold(householdId, id);
    }
    setFullByCode(householdId, code, body) {
        return this.service.setFullByCodeForHousehold(householdId, code, body);
    }
};
exports.BoxesController = BoxesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, active_household_decorator_1.ActiveHouseholdId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BoxesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, active_household_decorator_1.ActiveHouseholdId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BoxesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, active_household_decorator_1.ActiveHouseholdId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BoxesController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(':id/identify'),
    __param(0, (0, active_household_decorator_1.ActiveHouseholdId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BoxesController.prototype, "identify", null);
__decorate([
    (0, common_1.Patch)(':id/set-full'),
    __param(0, (0, active_household_decorator_1.ActiveHouseholdId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], BoxesController.prototype, "setFull", null);
__decorate([
    (0, common_1.Post)(':id/recalibrate-full'),
    __param(0, (0, active_household_decorator_1.ActiveHouseholdId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], BoxesController.prototype, "recalibrateFull", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, active_household_decorator_1.ActiveHouseholdId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BoxesController.prototype, "delete", null);
__decorate([
    (0, common_1.Patch)('by-code/:code/set-full'),
    __param(0, (0, active_household_decorator_1.ActiveHouseholdId)()),
    __param(1, (0, common_1.Param)('code')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], BoxesController.prototype, "setFullByCode", null);
exports.BoxesController = BoxesController = __decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, active_household_guard_1.ActiveHouseholdGuard),
    (0, common_1.Controller)('boxes'),
    __metadata("design:paramtypes", [boxes_service_1.BoxesService])
], BoxesController);
//# sourceMappingURL=boxes.controller.js.map