"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCatalogModule = void 0;
const common_1 = require("@nestjs/common");
const admin_catalog_controller_1 = require("./admin-catalog.controller");
const admin_catalog_service_1 = require("./admin-catalog.service");
const admin_catalog_repo_prisma_1 = require("./admin-catalog.repo.prisma");
const admin_terms_repo_prisma_1 = require("./admin-terms.repo.prisma");
const admin_terms_service_1 = require("./admin-terms.service");
const admin_terms_controller_1 = require("./admin-terms.controller");
let AdminCatalogModule = class AdminCatalogModule {
};
exports.AdminCatalogModule = AdminCatalogModule;
exports.AdminCatalogModule = AdminCatalogModule = __decorate([
    (0, common_1.Module)({
        controllers: [admin_catalog_controller_1.AdminCatalogController, admin_terms_controller_1.AdminTermsController],
        providers: [admin_catalog_service_1.AdminCatalogService, admin_catalog_repo_prisma_1.AdminCatalogRepoPrisma, admin_terms_repo_prisma_1.AdminTermsRepoPrisma, admin_terms_service_1.AdminTermsService],
    })
], AdminCatalogModule);
//# sourceMappingURL=admin-catalog.module.js.map