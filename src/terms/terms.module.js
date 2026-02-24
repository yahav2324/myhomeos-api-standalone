import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { TermsController } from './terms.controller';
import { TermsService } from './terms.service';
import { TermsRepoPrisma } from './terms.repo.prisma';
let TermsModule = class TermsModule {
};
TermsModule = __decorate([
    Module({
        controllers: [TermsController],
        providers: [TermsService, TermsRepoPrisma],
        exports: [TermsService],
    })
], TermsModule);
export { TermsModule };
//# sourceMappingURL=terms.module.js.map