"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const boxes_module_1 = require("../boxes/boxes.module");
const telemetry_module_1 = require("../telemetry/telemetry.module");
const ws_module_1 = require("../ws/ws.module");
const prisma_module_1 = require("../prisma/prisma.module");
const households_module_1 = require("../households/households.module");
const auth_module_1 = require("../auth/auth.module");
const terms_1 = require("../terms");
const admin_catalog_module_1 = require("../admin-catalog/admin-catalog.module");
const config_1 = require("@nestjs/config");
const shopping_module_1 = require("../shopping/shopping.module");
const health_module_1 = require("../health/health.module");
const files_modules_1 = require("../files/files.modules");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'uploads'),
                serveRoot: '/uploads',
            }),
            ws_module_1.WsModule,
            boxes_module_1.BoxesModule,
            telemetry_module_1.TelemetryModule,
            prisma_module_1.PrismaModule,
            households_module_1.HouseholdsModule,
            auth_module_1.AuthModule,
            terms_1.TermsModule,
            admin_catalog_module_1.AdminCatalogModule,
            shopping_module_1.ShoppingModule,
            health_module_1.HealthModule,
            files_modules_1.FilesModule,
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env', 'apps/api/.env'],
            }),
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map