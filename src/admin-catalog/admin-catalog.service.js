import { __awaiter, __decorate, __metadata } from "tslib";
import { BadRequestException, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { AdminCatalogRepoPrisma } from './admin-catalog.repo.prisma';
const DEFAULT_CFG = { minQueryChars: 2, upApproveMin: 5, downRejectMin: 10 };
const PatchSchema = z.object({
    minQueryChars: z.number().int().min(1).max(10).optional(),
    upApproveMin: z.number().int().min(1).max(1000).optional(),
    downRejectMin: z.number().int().min(1).max(1000).optional(),
});
function normalizeCfg(x) {
    var _a, _b, _c;
    return {
        minQueryChars: Number((_a = x === null || x === void 0 ? void 0 : x.minQueryChars) !== null && _a !== void 0 ? _a : DEFAULT_CFG.minQueryChars),
        upApproveMin: Number((_b = x === null || x === void 0 ? void 0 : x.upApproveMin) !== null && _b !== void 0 ? _b : DEFAULT_CFG.upApproveMin),
        downRejectMin: Number((_c = x === null || x === void 0 ? void 0 : x.downRejectMin) !== null && _c !== void 0 ? _c : DEFAULT_CFG.downRejectMin),
    };
}
let AdminCatalogService = class AdminCatalogService {
    constructor(repo) {
        this.repo = repo;
    }
    getConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            const row = yield this.repo.getConfigRow();
            if (!row) {
                yield this.repo.upsertConfig(DEFAULT_CFG);
                return DEFAULT_CFG;
            }
            return normalizeCfg(row.json);
        });
    }
    patchConfig(adminId, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const parsed = PatchSchema.safeParse(body);
            if (!parsed.success)
                throw new BadRequestException(parsed.error.flatten());
            const before = yield this.getConfig();
            const after = Object.assign(Object.assign({}, before), parsed.data);
            yield this.repo.upsertConfig(after);
            yield this.repo.audit({ adminId, action: 'CONFIG_PATCH', before, after });
            return after;
        });
    }
};
AdminCatalogService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [AdminCatalogRepoPrisma])
], AdminCatalogService);
export { AdminCatalogService };
//# sourceMappingURL=admin-catalog.service.js.map