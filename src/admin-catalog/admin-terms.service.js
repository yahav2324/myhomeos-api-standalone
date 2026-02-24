import { __awaiter, __decorate, __metadata } from "tslib";
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { z } from 'zod';
import { AdminTermsRepoPrisma } from './admin-terms.repo.prisma';
import { AdminCatalogService } from './admin-catalog.service';
import { AdminCatalogRepoPrisma } from './admin-catalog.repo.prisma';
const ListSchema = z.object({
    status: z.enum(['LIVE', 'PENDING', 'APPROVED', 'REJECTED']).default('LIVE'),
    lang: z.string().min(2).max(10).default('en'),
    q: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(30),
    cursor: z.string().optional(),
});
let AdminTermsService = class AdminTermsService {
    constructor(repo, cfg, audit) {
        this.repo = repo;
        this.cfg = cfg;
        this.audit = audit;
    }
    list(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const parsed = ListSchema.safeParse(query);
            if (!parsed.success)
                throw new BadRequestException(parsed.error.flatten());
            const { status, lang, q, limit, cursor } = parsed.data;
            const res = yield this.repo.list({ status: status, lang, q, limit, cursor });
            const items = yield Promise.all(res.rows.map((t) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f;
                const counts = yield this.repo.voteCounts(t.id);
                const text = (_f = (_d = (_b = (_a = t.translations.find((x) => x.lang === lang)) === null || _a === void 0 ? void 0 : _a.text) !== null && _b !== void 0 ? _b : (_c = t.translations.find((x) => x.lang === 'en')) === null || _c === void 0 ? void 0 : _c.text) !== null && _d !== void 0 ? _d : (_e = t.translations[0]) === null || _e === void 0 ? void 0 : _e.text) !== null && _f !== void 0 ? _f : '';
                return {
                    id: t.id,
                    status: t.status,
                    approvedByAdmin: t.approvedByAdmin,
                    text,
                    upCount: counts.up,
                    downCount: counts.down,
                    translations: t.translations.map((x) => ({
                        lang: x.lang,
                        text: x.text,
                        source: x.source,
                    })),
                    updatedAt: t.updatedAt,
                };
            })));
            return { ok: true, data: { items, nextCursor: res.nextCursor } };
        });
    }
    approve(adminId, termId) {
        return __awaiter(this, void 0, void 0, function* () {
            const before = yield this.repo.getTerm(termId);
            if (!before)
                throw new NotFoundException('Term not found');
            const after = yield this.repo.approve(termId);
            yield this.audit.audit({ adminId, action: 'TERM_APPROVE', targetId: termId, before, after });
            return { ok: true };
        });
    }
    reject(adminId, termId) {
        return __awaiter(this, void 0, void 0, function* () {
            const before = yield this.repo.getTerm(termId);
            if (!before)
                throw new NotFoundException('Term not found');
            const after = yield this.repo.reject(termId);
            yield this.audit.audit({ adminId, action: 'TERM_REJECT', targetId: termId, before, after });
            return { ok: true };
        });
    }
    autoRemoveIfTooManyDown(adminId, termId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cfg = yield this.cfg.getConfig();
            const before = yield this.repo.getTerm(termId);
            if (!before)
                throw new NotFoundException('Term not found');
            const counts = yield this.repo.voteCounts(termId);
            if (counts.down < cfg.downRejectMin) {
                return { ok: true, removed: false, downCount: counts.down, threshold: cfg.downRejectMin };
            }
            const after = yield this.repo.reject(termId);
            yield this.audit.audit({
                adminId,
                action: 'TERM_REJECT_BY_DOWN_THRESHOLD',
                targetId: termId,
                before,
                after,
            });
            return { ok: true, removed: true, downCount: counts.down, threshold: cfg.downRejectMin };
        });
    }
};
AdminTermsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [AdminTermsRepoPrisma,
        AdminCatalogService,
        AdminCatalogRepoPrisma])
], AdminTermsService);
export { AdminTermsService };
//# sourceMappingURL=admin-terms.service.js.map