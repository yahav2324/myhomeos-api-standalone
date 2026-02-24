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
exports.AdminTermsService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const admin_terms_repo_prisma_1 = require("./admin-terms.repo.prisma");
const admin_catalog_service_1 = require("./admin-catalog.service");
const admin_catalog_repo_prisma_1 = require("./admin-catalog.repo.prisma");
const ListSchema = zod_1.z.object({
    status: zod_1.z.enum(['LIVE', 'PENDING', 'APPROVED', 'REJECTED']).default('LIVE'),
    lang: zod_1.z.string().min(2).max(10).default('en'),
    q: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(30),
    cursor: zod_1.z.string().optional(),
});
let AdminTermsService = class AdminTermsService {
    constructor(repo, cfg, audit) {
        this.repo = repo;
        this.cfg = cfg;
        this.audit = audit;
    }
    async list(query) {
        const parsed = ListSchema.safeParse(query);
        if (!parsed.success)
            throw new common_1.BadRequestException(parsed.error.flatten());
        const { status, lang, q, limit, cursor } = parsed.data;
        const res = await this.repo.list({ status: status, lang, q, limit, cursor });
        const items = await Promise.all(res.rows.map(async (t) => {
            const counts = await this.repo.voteCounts(t.id);
            const text = t.translations.find((x) => x.lang === lang)?.text ??
                t.translations.find((x) => x.lang === 'en')?.text ??
                t.translations[0]?.text ??
                '';
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
        }));
        return { ok: true, data: { items, nextCursor: res.nextCursor } };
    }
    async approve(adminId, termId) {
        const before = await this.repo.getTerm(termId);
        if (!before)
            throw new common_1.NotFoundException('Term not found');
        const after = await this.repo.approve(termId);
        await this.audit.audit({ adminId, action: 'TERM_APPROVE', targetId: termId, before, after });
        return { ok: true };
    }
    async reject(adminId, termId) {
        const before = await this.repo.getTerm(termId);
        if (!before)
            throw new common_1.NotFoundException('Term not found');
        const after = await this.repo.reject(termId);
        await this.audit.audit({ adminId, action: 'TERM_REJECT', targetId: termId, before, after });
        return { ok: true };
    }
    async autoRemoveIfTooManyDown(adminId, termId) {
        const cfg = await this.cfg.getConfig();
        const before = await this.repo.getTerm(termId);
        if (!before)
            throw new common_1.NotFoundException('Term not found');
        const counts = await this.repo.voteCounts(termId);
        if (counts.down < cfg.downRejectMin) {
            return { ok: true, removed: false, downCount: counts.down, threshold: cfg.downRejectMin };
        }
        const after = await this.repo.reject(termId);
        await this.audit.audit({
            adminId,
            action: 'TERM_REJECT_BY_DOWN_THRESHOLD',
            targetId: termId,
            before,
            after,
        });
        return { ok: true, removed: true, downCount: counts.down, threshold: cfg.downRejectMin };
    }
};
exports.AdminTermsService = AdminTermsService;
exports.AdminTermsService = AdminTermsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [admin_terms_repo_prisma_1.AdminTermsRepoPrisma,
        admin_catalog_service_1.AdminCatalogService,
        admin_catalog_repo_prisma_1.AdminCatalogRepoPrisma])
], AdminTermsService);
//# sourceMappingURL=admin-terms.service.js.map