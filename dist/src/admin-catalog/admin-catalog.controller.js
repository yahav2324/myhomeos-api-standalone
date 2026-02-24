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
exports.AdminCatalogController = void 0;
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../auth/jwt.guard");
const admin_catalog_service_1 = require("./admin-catalog.service");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const admin_guard_1 = require("../auth/guard/admin.guard");
let AdminCatalogController = class AdminCatalogController {
    constructor(svc) {
        this.svc = svc;
    }
    async get() {
        return { ok: true, data: await this.svc.getConfig() };
    }
    async patch(userId, body) {
        return { ok: true, data: await this.svc.patchConfig(userId, body) };
    }
};
exports.AdminCatalogController = AdminCatalogController;
__decorate([
    (0, common_1.Get)('/config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminCatalogController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)('/config'),
    __param(0, (0, current_user_decorator_1.CurrentHouseholdId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminCatalogController.prototype, "patch", null);
exports.AdminCatalogController = AdminCatalogController = __decorate([
    (0, common_1.Controller)('/admin/catalog'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [admin_catalog_service_1.AdminCatalogService])
], AdminCatalogController);
//# sourceMappingURL=admin-catalog.controller.js.map