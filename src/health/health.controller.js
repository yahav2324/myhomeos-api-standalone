import { __decorate, __metadata } from "tslib";
import { Controller, Get } from '@nestjs/common';
let HealthController = class HealthController {
    health() {
        return { ok: true, ts: new Date().toISOString() };
    }
};
__decorate([
    Get('/health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "health", null);
HealthController = __decorate([
    Controller()
], HealthController);
export { HealthController };
//# sourceMappingURL=health.controller.js.map