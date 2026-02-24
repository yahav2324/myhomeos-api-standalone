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
exports.AdminCatalogService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const admin_catalog_repo_prisma_1 = require("./admin-catalog.repo.prisma");
const DEFAULT_CFG = { minQueryChars: 2, upApproveMin: 5, downRejectMin: 10 };
const PatchSchema = zod_1.z.object({
    minQueryChars: zod_1.z.number().int().min(1).max(10).optional(),
    upApproveMin: zod_1.z.number().int().min(1).max(1000).optional(),
    downRejectMin: zod_1.z.number().int().min(1).max(1000).optional(),
});
function normalizeCfg(x) {
    return {
        minQueryChars: Number(x?.minQueryChars ?? DEFAULT_CFG.minQueryChars),
        upApproveMin: Number(x?.upApproveMin ?? DEFAULT_CFG.upApproveMin),
        downRejectMin: Number(x?.downRejectMin ?? DEFAULT_CFG.downRejectMin),
    };
}
let AdminCatalogService = class AdminCatalogService {
    constructor(repo) {
        this.repo = repo;
    }
    async getConfig() {
        const row = await this.repo.getConfigRow();
        if (!row) {
            await this.repo.upsertConfig(DEFAULT_CFG);
            return DEFAULT_CFG;
        }
        return normalizeCfg(row.json);
    }
    async patchConfig(adminId, body) {
        const parsed = PatchSchema.safeParse(body);
        if (!parsed.success)
            throw new common_1.BadRequestException(parsed.error.flatten());
        const before = await this.getConfig();
        const after = { ...before, ...parsed.data };
        await this.repo.upsertConfig(after);
        await this.repo.audit({ adminId, action: 'CONFIG_PATCH', before, after });
        return after;
    }
};
exports.AdminCatalogService = AdminCatalogService;
exports.AdminCatalogService = AdminCatalogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [admin_catalog_repo_prisma_1.AdminCatalogRepoPrisma])
], AdminCatalogService);
//# sourceMappingURL=admin-catalog.service.js.map