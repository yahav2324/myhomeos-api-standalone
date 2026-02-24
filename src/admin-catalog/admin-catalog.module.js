import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { AdminCatalogController } from './admin-catalog.controller';
import { AdminCatalogService } from './admin-catalog.service';
import { AdminCatalogRepoPrisma } from './admin-catalog.repo.prisma';
import { AdminTermsRepoPrisma } from './admin-terms.repo.prisma';
import { AdminTermsService } from './admin-terms.service';
import { AdminTermsController } from './admin-terms.controller';
let AdminCatalogModule = class AdminCatalogModule {
};
AdminCatalogModule = __decorate([
    Module({
        controllers: [AdminCatalogController, AdminTermsController],
        providers: [AdminCatalogService, AdminCatalogRepoPrisma, AdminTermsRepoPrisma, AdminTermsService],
    })
], AdminCatalogModule);
export { AdminCatalogModule };
//# sourceMappingURL=admin-catalog.module.js.map