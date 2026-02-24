import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
let AdminCatalogRepoPrisma = class AdminCatalogRepoPrisma {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getConfigRow() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.systemConfig.findUnique({ where: { key: 'catalog' } });
        });
    }
    upsertConfig(json) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.systemConfig.upsert({
                where: { key: 'catalog' },
                update: { json: json },
                create: { key: 'catalog', json: json },
            });
        });
    }
    audit(args) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            return this.prisma.adminAuditLog.create({
                data: {
                    adminId: args.adminId,
                    action: args.action,
                    targetId: (_a = args.targetId) !== null && _a !== void 0 ? _a : null,
                    before: (_b = args.before) !== null && _b !== void 0 ? _b : undefined,
                    after: (_c = args.after) !== null && _c !== void 0 ? _c : undefined,
                },
            });
        });
    }
};
AdminCatalogRepoPrisma = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], AdminCatalogRepoPrisma);
export { AdminCatalogRepoPrisma };
//# sourceMappingURL=admin-catalog.repo.prisma.js.map