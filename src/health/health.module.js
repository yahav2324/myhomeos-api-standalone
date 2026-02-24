import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
let HealthModule = class HealthModule {
};
HealthModule = __decorate([
    Module({
        controllers: [HealthController],
    })
], HealthModule);
export { HealthModule };
//# sourceMappingURL=health.module.js.map