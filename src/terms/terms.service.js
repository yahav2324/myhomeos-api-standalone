import { __awaiter, __decorate, __metadata } from "tslib";
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ShoppingCategory, ShoppingUnit, TermScope, TermStatus, VoteValue } from '@prisma/client';
import { z } from 'zod';
import { TermsRepoPrisma } from './terms.repo.prisma';
import { UpsertMyDefaultsSchema } from "../../internal-libs/contracts/src/index";
// ---- Zod schemas ----
const CreateTermBodySchema = z.object({
    text: z.string().min(1).max(80),
    lang: z.string().min(2).max(10).optional(), // "he" | "en" ...
    scope: z.enum(['GLOBAL', 'PRIVATE']).optional(),
    category: z.nativeEnum(ShoppingCategory).optional(),
    unit: z.nativeEnum(ShoppingUnit).optional(),
    qty: z.number().positive().optional(),
    extras: z.record(z.string(), z.string()).optional(),
    imageUrl: z.string().url().optional(),
    // new names from client (optional)
    defaultCategory: z.nativeEnum(ShoppingCategory).optional(),
    defaultUnit: z.nativeEnum(ShoppingUnit).optional(),
    defaultQty: z.number().positive().optional(),
    defaultExtras: z.record(z.string(), z.string()).optional(),
});
const VoteBodySchema = z.object({
    vote: z.enum(['UP', 'DOWN']),
});
const DEFAULT_CATALOG_CONFIG = {
    minQueryChars: 2,
    upApproveMin: 5,
    downRejectMin: 10,
};
// ---- helpers ----
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
// בעתיד: translate provider
function translateToEnglish(text, fromLang) {
    return __awaiter(this, void 0, void 0, function* () {
        void text;
        void fromLang;
        return null;
    });
}
let TermsService = class TermsService {
    constructor(repo) {
        this.repo = repo;
    }
    getCatalogConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const row = yield this.repo.getSystemConfig('catalog');
            if (!(row === null || row === void 0 ? void 0 : row.json) || typeof row.json !== 'object') {
                yield this.repo.upsertSystemConfig('catalog', { catalog: DEFAULT_CATALOG_CONFIG });
                return DEFAULT_CATALOG_CONFIG;
            }
            const obj = row.json;
            const cfg = (_a = obj.catalog) !== null && _a !== void 0 ? _a : obj;
            return {
                minQueryChars: Number((_b = cfg.minQueryChars) !== null && _b !== void 0 ? _b : DEFAULT_CATALOG_CONFIG.minQueryChars),
                upApproveMin: Number((_c = cfg.upApproveMin) !== null && _c !== void 0 ? _c : DEFAULT_CATALOG_CONFIG.upApproveMin),
                downRejectMin: Number((_d = cfg.downRejectMin) !== null && _d !== void 0 ? _d : DEFAULT_CATALOG_CONFIG.downRejectMin),
            };
        });
    }
    setTermImage(termId, imageUrl, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const term = yield this.repo.findTermById(termId);
            if (!term)
                throw new NotFoundException('Term not found');
            // רק הבעלים של מונח פרטי או אדמין יכולים לשנות את התמונה
            if (term.scope === TermScope.PRIVATE && term.ownerUserId !== userId) {
                throw new BadRequestException('Not authorized to change image of this term');
            }
            const updated = yield this.repo.setTermImage(termId, imageUrl);
            return { ok: true, data: updated };
        });
    }
    suggest(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const cfg = yield this.getCatalogConfig();
            const qTrim = args.q.trim();
            if (qTrim.length < cfg.minQueryChars)
                return [];
            const qNorm = normalizeText(qTrim);
            const lang = (args.lang || 'en').trim().toLowerCase();
            const limit = Math.min(Math.max(args.limit || 10, 1), 30);
            return this.repo.suggest({ qNorm, lang, limit, userId: args.userId });
        });
    }
    create(body, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            const parsed = CreateTermBodySchema.safeParse(body);
            if (!parsed.success)
                throw new BadRequestException(parsed.error.flatten());
            const text = parsed.data.text.trim();
            const lang = (((_a = parsed.data.lang) === null || _a === void 0 ? void 0 : _a.trim()) || detectLang(text) || 'und').toLowerCase();
            const scope = ((_b = parsed.data.scope) !== null && _b !== void 0 ? _b : 'GLOBAL');
            const cat = (_d = (_c = parsed.data.defaultCategory) !== null && _c !== void 0 ? _c : parsed.data.category) !== null && _d !== void 0 ? _d : null;
            const unit = (_f = (_e = parsed.data.defaultUnit) !== null && _e !== void 0 ? _e : parsed.data.unit) !== null && _f !== void 0 ? _f : null;
            const qty = (_h = (_g = parsed.data.defaultQty) !== null && _g !== void 0 ? _g : parsed.data.qty) !== null && _h !== void 0 ? _h : null;
            const extras = (_k = (_j = parsed.data.defaultExtras) !== null && _j !== void 0 ? _j : parsed.data.extras) !== null && _k !== void 0 ? _k : null;
            const imageUrl = (_l = parsed.data.imageUrl) !== null && _l !== void 0 ? _l : null;
            // ✅ PRIVATE נשאר פרטי ליוצר
            const term = yield this.repo.createTerm({
                scope: scope === 'PRIVATE' ? TermScope.PRIVATE : TermScope.GLOBAL,
                ownerUserId: scope === 'PRIVATE' ? userId : null,
                status: scope === 'PRIVATE' ? TermStatus.PENDING : TermStatus.LIVE,
                translations: [{ lang, text, normalized: normalizeText(text), source: 'USER' }],
                imageUrl,
                defaultCategory: cat,
                defaultUnit: unit,
                defaultQty: qty,
                defaultExtras: extras,
            });
            // Auto translate to English (optional)
            const hasEn = term.translations.some((t) => t.lang === 'en');
            if (!hasEn && lang !== 'en') {
                try {
                    const en = yield translateToEnglish(text, lang);
                    if (en && en.trim().length > 0) {
                        yield this.repo.addTranslation({
                            termId: term.id,
                            lang: 'en',
                            text: en.trim(),
                            normalized: normalizeText(en),
                            source: 'AUTO',
                        });
                    }
                }
                catch (_m) {
                    // ignore
                }
            }
            const fresh = yield this.repo.findTermById(term.id);
            return {
                ok: true,
                data: fresh,
            };
        });
    }
    upsertMyDefaults(termId, body, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const parsed = UpsertMyDefaultsSchema.safeParse(body);
            if (!parsed.success)
                throw new BadRequestException(parsed.error.flatten());
            const term = yield this.repo.findTermById(termId);
            if (!term)
                throw new NotFoundException('Term not found');
            const d = parsed.data;
            const row = yield this.repo.upsertMyDefaults({
                termId,
                userId,
                category: (_a = d.category) !== null && _a !== void 0 ? _a : null,
                unit: (_b = d.unit) !== null && _b !== void 0 ? _b : null,
                qty: (_c = d.qty) !== null && _c !== void 0 ? _c : null,
                extras: (_d = d.extras) !== null && _d !== void 0 ? _d : null,
            });
            return { ok: true, data: row };
        });
    }
    vote(termId, body, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const parsed = VoteBodySchema.safeParse(body);
            if (!parsed.success)
                throw new BadRequestException(parsed.error.flatten());
            const term = yield this.repo.findTermById(termId);
            if (!term)
                throw new NotFoundException('Term not found');
            // vote upsert
            yield this.repo.upsertVote({
                termId,
                userId,
                vote: parsed.data.vote === 'UP' ? VoteValue.UP : VoteValue.DOWN,
            });
            const cfg = yield this.getCatalogConfig();
            const counts = yield this.repo.getVoteCounts(termId);
            let newStatus = term.status;
            let approvedAt = (_a = term.approvedAt) !== null && _a !== void 0 ? _a : null;
            if (term.approvedByAdmin) {
                newStatus = TermStatus.APPROVED;
                if (!approvedAt)
                    approvedAt = new Date();
            }
            else if (counts.up >= cfg.upApproveMin) {
                newStatus = TermStatus.APPROVED;
                if (!approvedAt)
                    approvedAt = new Date();
            }
            else if (counts.down >= cfg.downRejectMin) {
                newStatus = TermStatus.REJECTED;
                approvedAt = null;
            }
            else {
                // ✅ נשאר LIVE כדי שכולם ימשיכו לראות ולדרג
                // (PENDING שמור למקרה של “ריסאבמיט” בעתיד / או PRIVATE)
                newStatus = term.scope === TermScope.PRIVATE ? TermStatus.PENDING : TermStatus.LIVE;
                approvedAt = null;
            }
            const updated = yield this.repo.updateTermStatus(termId, newStatus, approvedAt);
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
        });
    }
};
TermsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [TermsRepoPrisma])
], TermsService);
export { TermsService };
//# sourceMappingURL=terms.service.js.map