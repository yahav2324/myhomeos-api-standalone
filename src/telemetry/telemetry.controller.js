import { __awaiter, __decorate, __metadata, __param } from "tslib";
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
let TelemetryController = class TelemetryController {
    constructor(service) {
        this.service = service;
    }
    ingest(body) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.service.ingest(body);
        });
    }
    history(boxId, hours) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.service.history(boxId, hours);
        });
    }
};
__decorate([
    Post(),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelemetryController.prototype, "ingest", null);
__decorate([
    UseGuards(JwtAuthGuard),
    Get('history/:boxId'),
    __param(0, Param('boxId')),
    __param(1, Query('hours')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TelemetryController.prototype, "history", null);
TelemetryController = __decorate([
    Controller('telemetry'),
    __metadata("design:paramtypes", [TelemetryService])
], TelemetryController);
export { TelemetryController };
//# sourceMappingURL=telemetry.controller.js.map