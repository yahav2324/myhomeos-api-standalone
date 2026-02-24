import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { ShoppingController } from './shopping.controller';
import { ShoppingService } from './shopping.service';
let ShoppingModule = class ShoppingModule {
};
ShoppingModule = __decorate([
    Module({
        controllers: [ShoppingController],
        providers: [ShoppingService],
    })
], ShoppingModule);
export { ShoppingModule };
//# sourceMappingURL=shopping.module.js.map