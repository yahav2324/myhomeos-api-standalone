import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { BoxesGateway } from './boxes.gateway';
let WsModule = class WsModule {
};
WsModule = __decorate([
    Module({
        providers: [BoxesGateway],
        exports: [BoxesGateway],
    })
], WsModule);
export { WsModule };
//# sourceMappingURL=ws.module.js.map