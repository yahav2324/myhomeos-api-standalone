import { __awaiter, __decorate, __metadata, __param } from "tslib";
import { Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AdminTermsService } from './admin-terms.service';
import { AdminGuard } from '../auth/guard/admin.guard';
import { JwtAuthGuard } from '../auth/jwt.guard';
let AdminTermsController = class AdminTermsController {
    constructor(svc) {
        this.svc = svc;
    }
    list(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.svc.list(query);
        });
    }
    approve(req, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.svc.approve(req.user.id, id);
        });
    }
    reject(req, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.svc.reject(req.user.id, id);
        });
    }
    autoRemove(req, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.svc.autoRemoveIfTooManyDown(req.user.id, id);
        });
    }
};
__decorate([
    Get(),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminTermsController.prototype, "list", null);
__decorate([
    Patch('/:id/approve'),
    __param(0, Req()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminTermsController.prototype, "approve", null);
__decorate([
    Patch('/:id/reject'),
    __param(0, Req()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminTermsController.prototype, "reject", null);
__decorate([
    Post('/:id/auto-remove-if-too-many-down'),
    __param(0, Req()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminTermsController.prototype, "autoRemove", null);
AdminTermsController = __decorate([
    Controller('/admin/terms'),
    UseGuards(JwtAuthGuard, AdminGuard),
    __metadata("design:paramtypes", [AdminTermsService])
], AdminTermsController);
export { AdminTermsController };
//# sourceMappingURL=admin-terms.controller.js.map