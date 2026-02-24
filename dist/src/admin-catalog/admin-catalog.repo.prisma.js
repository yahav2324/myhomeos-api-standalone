"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCatalogRepoPrisma = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminCatalogRepoPrisma = class AdminCatalogRepoPrisma {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getConfigRow() {
        return this.prisma.systemConfig.findUnique({ where: { key: 'catalog' } });
    }
    async upsertConfig(json) {
        return this.prisma.systemConfig.upsert({
            where: { key: 'catalog' },
            update: { json: json },
            create: { key: 'catalog', json: json },
        });
    }
    async audit(args) {
        return this.prisma.adminAuditLog.create({
            data: {
                adminId: args.adminId,
                action: args.action,
                targetId: args.targetId ?? null,
                before: args.before ?? undefined,
                after: args.after ?? undefined,
            },
        });
    }
};
exports.AdminCatalogRepoPrisma = AdminCatalogRepoPrisma;
exports.AdminCatalogRepoPrisma = AdminCatalogRepoPrisma = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminCatalogRepoPrisma);
//# sourceMappingURL=admin-catalog.repo.prisma.js.map