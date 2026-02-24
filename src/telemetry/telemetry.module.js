import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';
import { BoxesModule } from '../boxes/boxes.module';
import { TelemetryRepoPrisma } from './telemetry.repo.prisma';
let TelemetryModule = class TelemetryModule {
};
TelemetryModule = __decorate([
    Module({
        imports: [BoxesModule],
        controllers: [TelemetryController],
        providers: [TelemetryService, TelemetryRepoPrisma],
    })
], TelemetryModule);
export { TelemetryModule };
//# sourceMappingURL=telemetry.module.js.map