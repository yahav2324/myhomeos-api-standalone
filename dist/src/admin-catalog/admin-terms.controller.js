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
exports.AdminTermsController = void 0;
const common_1 = require("@nestjs/common");
const admin_terms_service_1 = require("./admin-terms.service");
const admin_guard_1 = require("../auth/guard/admin.guard");
const jwt_guard_1 = require("../auth/jwt.guard");
let AdminTermsController = class AdminTermsController {
    constructor(svc) {
        this.svc = svc;
    }
    async list(query) {
        return this.svc.list(query);
    }
    async approve(req, id) {
        return this.svc.approve(req.user.id, id);
    }
    async reject(req, id) {
        return this.svc.reject(req.user.id, id);
    }
    async autoRemove(req, id) {
        return this.svc.autoRemoveIfTooManyDown(req.user.id, id);
    }
};
exports.AdminTermsController = AdminTermsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminTermsController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)('/:id/approve'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminTermsController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)('/:id/reject'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminTermsController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)('/:id/auto-remove-if-too-many-down'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminTermsController.prototype, "autoRemove", null);
exports.AdminTermsController = AdminTermsController = __decorate([
    (0, common_1.Controller)('/admin/terms'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [admin_terms_service_1.AdminTermsService])
], AdminTermsController);
//# sourceMappingURL=admin-terms.controller.js.map