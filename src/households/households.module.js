import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { HouseholdsController } from './households.controller';
import { HouseholdsService } from './households.service';
import { HouseholdsRepoPrisma } from './households.repo.prisma';
let HouseholdsModule = class HouseholdsModule {
};
HouseholdsModule = __decorate([
    Module({
        controllers: [HouseholdsController],
        providers: [HouseholdsService, HouseholdsRepoPrisma],
        exports: [HouseholdsService],
    })
], HouseholdsModule);
export { HouseholdsModule };
//# sourceMappingURL=households.module.js.map