import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
let FilesModule = class FilesModule {
};
FilesModule = __decorate([
    Module({
        controllers: [FilesController],
    })
], FilesModule);
export { FilesModule };
//# sourceMappingURL=files.modules.js.map