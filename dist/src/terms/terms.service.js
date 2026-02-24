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
exports.TermsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const terms_repo_prisma_1 = require("./terms.repo.prisma");
const contracts_1 = require("../../internal-libs/contracts/src/index");
const CreateTermBodySchema = zod_1.z.object({
    text: zod_1.z.string().min(1).max(80),
    lang: zod_1.z.string().min(2).max(10).optional(),
    scope: zod_1.z.enum(['GLOBAL', 'PRIVATE']).optional(),
    category: zod_1.z.nativeEnum(client_1.ShoppingCategory).optional(),
    unit: zod_1.z.nativeEnum(client_1.ShoppingUnit).optional(),
    qty: zod_1.z.number().positive().optional(),
    extras: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
    imageUrl: zod_1.z.string().url().optional(),
    defaultCategory: zod_1.z.nativeEnum(client_1.ShoppingCategory).optional(),
    defaultUnit: zod_1.z.nativeEnum(client_1.ShoppingUnit).optional(),
    defaultQty: zod_1.z.number().positive().optional(),
    defaultExtras: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
});
const VoteBodySchema = zod_1.z.object({
    vote: zod_1.z.enum(['UP', 'DOWN']),
});
const DEFAULT_CATALOG_CONFIG = {
    minQueryChars: 2,
    upApproveMin: 5,
    downRejectMin: 10,
};
function normalizeText(s) {
    return s.trim().toLowerCase();
}
function detectLang(text) {
    const t = text.trim();
    if (/[֐-׿]/.test(t))
        return 'he';
    if (/[a-zA-Z]/.test(t))
        return 'en';
    return 'und';
}
async function translateToEnglish(text, fromLang) {
    void text;
    void fromLang;
    return null;
}
let TermsService = class TermsService {
    constructor(repo) {
        this.repo = repo;
    }
    async getCatalogConfig() {
        const row = await this.repo.getSystemConfig('catalog');
        if (!row?.json || typeof row.json !== 'object') {
            await this.repo.upsertSystemConfig('catalog', { catalog: DEFAULT_CATALOG_CONFIG });
            return DEFAULT_CATALOG_CONFIG;
        }
        const obj = row.json;
        const cfg = obj.catalog ?? obj;
        return {
            minQueryChars: Number(cfg.minQueryChars ?? DEFAULT_CATALOG_CONFIG.minQueryChars),
            upApproveMin: Number(cfg.upApproveMin ?? DEFAULT_CATALOG_CONFIG.upApproveMin),
            downRejectMin: Number(cfg.downRejectMin ?? DEFAULT_CATALOG_CONFIG.downRejectMin),
        };
    }
    async setTermImage(termId, imageUrl, userId) {
        const term = await this.repo.findTermById(termId);
        if (!term)
            throw new common_1.NotFoundException('Term not found');
        if (term.scope === client_1.TermScope.PRIVATE && term.ownerUserId !== userId) {
            throw new common_1.BadRequestException('Not authorized to change image of this term');
        }
        const updated = await this.repo.setTermImage(termId, imageUrl);
        return { ok: true, data: updated };
    }
    async suggest(args) {
        const cfg = await this.getCatalogConfig();
        const qTrim = args.q.trim();
        if (qTrim.length < cfg.minQueryChars)
            return [];
        const qNorm = normalizeText(qTrim);
        const lang = (args.lang || 'en').trim().toLowerCase();
        const limit = Math.min(Math.max(args.limit || 10, 1), 30);
        return this.repo.suggest({ qNorm, lang, limit, userId: args.userId });
    }
    async create(body, userId) {
        const parsed = CreateTermBodySchema.safeParse(body);
        if (!parsed.success)
            throw new common_1.BadRequestException(parsed.error.flatten());
        const text = parsed.data.text.trim();
        const lang = (parsed.data.lang?.trim() || detectLang(text) || 'und').toLowerCase();
        const scope = (parsed.data.scope ?? 'GLOBAL');
        const cat = parsed.data.defaultCategory ?? parsed.data.category ?? null;
        const unit = parsed.data.defaultUnit ?? parsed.data.unit ?? null;
        const qty = parsed.data.defaultQty ?? parsed.data.qty ?? null;
        const extras = parsed.data.defaultExtras ?? parsed.data.extras ?? null;
        const imageUrl = parsed.data.imageUrl ?? null;
        const term = await this.repo.createTerm({
            scope: scope === 'PRIVATE' ? client_1.TermScope.PRIVATE : client_1.TermScope.GLOBAL,
            ownerUserId: scope === 'PRIVATE' ? userId : null,
            status: scope === 'PRIVATE' ? client_1.TermStatus.PENDING : client_1.TermStatus.LIVE,
            translations: [{ lang, text, normalized: normalizeText(text), source: 'USER' }],
            imageUrl,
            defaultCategory: cat,
            defaultUnit: unit,
            defaultQty: qty,
            defaultExtras: extras,
        });
        const hasEn = term.translations.some((t) => t.lang === 'en');
        if (!hasEn && lang !== 'en') {
            try {
                const en = await translateToEnglish(text, lang);
                if (en && en.trim().length > 0) {
                    await this.repo.addTranslation({
                        termId: term.id,
                        lang: 'en',
                        text: en.trim(),
                        normalized: normalizeText(en),
                        source: 'AUTO',
                    });
                }
            }
            catch {
            }
        }
        const fresh = await this.repo.findTermById(term.id);
        return {
            ok: true,
            data: fresh,
        };
    }
    async upsertMyDefaults(termId, body, userId) {
        const parsed = contracts_1.UpsertMyDefaultsSchema.safeParse(body);
        if (!parsed.success)
            throw new common_1.BadRequestException(parsed.error.flatten());
        const term = await this.repo.findTermById(termId);
        if (!term)
            throw new common_1.NotFoundException('Term not found');
        const d = parsed.data;
        const row = await this.repo.upsertMyDefaults({
            termId,
            userId,
            category: d.category ?? null,
            unit: d.unit ?? null,
            qty: d.qty ?? null,
            extras: d.extras ?? null,
        });
        return { ok: true, data: row };
    }
    async vote(termId, body, userId) {
        const parsed = VoteBodySchema.safeParse(body);
        if (!parsed.success)
            throw new common_1.BadRequestException(parsed.error.flatten());
        const term = await this.repo.findTermById(termId);
        if (!term)
            throw new common_1.NotFoundException('Term not found');
        await this.repo.upsertVote({
            termId,
            userId,
            vote: parsed.data.vote === 'UP' ? client_1.VoteValue.UP : client_1.VoteValue.DOWN,
        });
        const cfg = await this.getCatalogConfig();
        const counts = await this.repo.getVoteCounts(termId);
        let newStatus = term.status;
        let approvedAt = term.approvedAt ?? null;
        if (term.approvedByAdmin) {
            newStatus = client_1.TermStatus.APPROVED;
            if (!approvedAt)
                approvedAt = new Date();
        }
        else if (counts.up >= cfg.upApproveMin) {
            newStatus = client_1.TermStatus.APPROVED;
            if (!approvedAt)
                approvedAt = new Date();
        }
        else if (counts.down >= cfg.downRejectMin) {
            newStatus = client_1.TermStatus.REJECTED;
            approvedAt = null;
        }
        else {
            newStatus = term.scope === client_1.TermScope.PRIVATE ? client_1.TermStatus.PENDING : client_1.TermStatus.LIVE;
            approvedAt = null;
        }
        const updated = await this.repo.updateTermStatus(termId, newStatus, approvedAt);
        return {
            ok: true,
            data: {
                id: termId,
                status: updated.status,
                approvedAt: updated.approvedAt,
                upCount: counts.up,
                downCount: counts.down,
                myVote: parsed.data.vote,
                thresholds: cfg,
            },
        };
    }
};
exports.TermsService = TermsService;
exports.TermsService = TermsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [terms_repo_prisma_1.TermsRepoPrisma])
], TermsService);
//# sourceMappingURL=terms.service.js.map