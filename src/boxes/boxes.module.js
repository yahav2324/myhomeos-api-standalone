import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { BoxesController } from './boxes.controller';
import { BoxesService } from './boxes.service';
import { BoxesGateway } from '../ws/boxes.gateway';
import { BoxesRepoPrisma } from './boxes.repo.prisma';
let BoxesModule = class BoxesModule {
};
BoxesModule = __decorate([
    Module({
        controllers: [BoxesController],
        providers: [
            BoxesService,
            BoxesGateway,
            {
                provide: 'BoxesRepository',
                useClass: BoxesRepoPrisma,
            },
        ],
        exports: [BoxesService, 'BoxesRepository'],
    })
], BoxesModule);
export { BoxesModule };
//# sourceMappingURL=boxes.module.js.map