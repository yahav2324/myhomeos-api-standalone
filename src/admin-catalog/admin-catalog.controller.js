import { __awaiter, __decorate, __metadata, __param } from "tslib";
import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AdminCatalogService } from './admin-catalog.service';
import { CurrentHouseholdId } from '../auth/current-user.decorator';
import { AdminGuard } from '../auth/guard/admin.guard';
let AdminCatalogController = class AdminCatalogController {
    constructor(svc) {
        this.svc = svc;
    }
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            return { ok: true, data: yield this.svc.getConfig() };
        });
    }
    patch(userId, body) {
        return __awaiter(this, void 0, void 0, function* () {
            return { ok: true, data: yield this.svc.patchConfig(userId, body) };
        });
    }
};
__decorate([
    Get('/config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminCatalogController.prototype, "get", null);
__decorate([
    Patch('/config'),
    __param(0, CurrentHouseholdId()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminCatalogController.prototype, "patch", null);
AdminCatalogController = __decorate([
    Controller('/admin/catalog'),
    UseGuards(JwtAuthGuard, AdminGuard),
    __metadata("design:paramtypes", [AdminCatalogService])
], AdminCatalogController);
export { AdminCatalogController };
//# sourceMappingURL=admin-catalog.controller.js.map