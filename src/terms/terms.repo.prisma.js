import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { TermScope, TermStatus, VoteValue, } from "@prisma/client";
const unitToApi = (u) => {
    if (!u)
        return null;
    const s = String(u);
    if (s === "PCS")
        return "pcs";
    if (s === "G")
        return "g";
    if (s === "KG")
        return "kg";
    if (s === "ML")
        return "ml";
    if (s === "L")
        return "l";
    return null;
};
let TermsRepoPrisma = class TermsRepoPrisma {
    constructor(prisma) {
        this.prisma = prisma;
    }
    // ---- System config ----
    getSystemConfig(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.systemConfig.findUnique({ where: { key } });
        });
    }
    upsertSystemConfig(key, json) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.systemConfig.upsert({
                where: { key },
                update: { json: json },
                create: { key, json: json },
            });
        });
    }
    // ---- Suggest ----
    // ---- Suggest ----
    suggest(args) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const qNorm = ((_a = args.qNorm) !== null && _a !== void 0 ? _a : "").trim();
            if (!qNorm)
                return [];
            const baseTermWhere = {
                OR: [
                    // ✅ גלובליים שנראים לכולם
                    {
                        scope: TermScope.GLOBAL,
                        status: { in: [TermStatus.LIVE, TermStatus.APPROVED] },
                    },
                    // ✅ PENDING/PRIVATE נראה רק ליוצר
                    args.userId
                        ? {
                            scope: TermScope.PRIVATE,
                            ownerUserId: args.userId,
                            status: {
                                in: [TermStatus.PENDING, TermStatus.LIVE, TermStatus.APPROVED],
                            },
                        }
                        : undefined,
                    // ✅ אם תרצה שגם PENDING גלובלי יראה רק ליוצר (לריסאבמיט)
                    args.userId
                        ? {
                            scope: TermScope.GLOBAL,
                            status: TermStatus.PENDING,
                            ownerUserId: args.userId,
                        }
                        : undefined,
                ].filter(Boolean),
            };
            // ✅ שלב 1: startsWith (מהיר + הכי רלוונטי)
            const starts = yield this.prisma.termTranslation.findMany({
                where: {
                    lang: args.lang,
                    normalized: { startsWith: qNorm },
                    term: baseTermWhere,
                },
                take: args.limit * 4,
                include: {
                    term: {
                        select: {
                            id: true,
                            scope: true,
                            ownerUserId: true,
                            status: true,
                            imageUrl: true, // ✅ הוסף
                            approvedByAdmin: true,
                            translations: { select: { lang: true, text: true } },
                        },
                    },
                },
                orderBy: [{ normalized: "asc" }],
            });
            // ✅ שלב 2: contains (רק אם חסר תוצאות) — מאפשר "אבקת שום"
            const needMore = starts.length < args.limit;
            const contains = needMore && qNorm.length >= 2
                ? yield this.prisma.termTranslation.findMany({
                    where: {
                        lang: args.lang,
                        normalized: { contains: qNorm },
                        term: baseTermWhere,
                    },
                    take: args.limit * 12, // contains רחב יותר
                    include: {
                        term: {
                            select: {
                                id: true,
                                scope: true,
                                ownerUserId: true,
                                status: true,
                                imageUrl: true, // ✅ הוסף
                                approvedByAdmin: true,
                                translations: { select: { lang: true, text: true } },
                            },
                        },
                    },
                    orderBy: [{ normalized: "asc" }],
                })
                : [];
            // מאחדים: starts קודם, ואז contains (כולל כפילויות אפשריות)
            const matches = [...starts, ...contains];
            const termIds = Array.from(new Set(matches.map((m) => m.termId)));
            if (termIds.length === 0)
                return [];
            const myDefaults = args.userId
                ? yield this.prisma.termUserDefaults.findMany({
                    where: { userId: args.userId, termId: { in: termIds } },
                    select: {
                        termId: true,
                        category: true,
                        unit: true,
                        qty: true,
                        extras: true,
                    },
                })
                : [];
            const myDefaultsByTerm = new Map(myDefaults.map((d) => [d.termId, d]));
            const grouped = yield this.prisma.termVote.groupBy({
                by: ["termId", "vote"],
                where: { termId: { in: termIds } },
                _count: { _all: true },
            });
            const countsByTerm = new Map();
            for (const g of grouped) {
                const cur = (_b = countsByTerm.get(g.termId)) !== null && _b !== void 0 ? _b : { up: 0, down: 0 };
                if (g.vote === VoteValue.UP)
                    cur.up = g._count._all;
                if (g.vote === VoteValue.DOWN)
                    cur.down = g._count._all;
                countsByTerm.set(g.termId, cur);
            }
            const myVotes = args.userId
                ? yield this.prisma.termVote.findMany({
                    where: { termId: { in: termIds }, userId: args.userId },
                    select: { termId: true, vote: true },
                })
                : [];
            const myVoteByTerm = new Map();
            for (const v of myVotes)
                myVoteByTerm.set(v.termId, v.vote);
            // ✅ החזרה בפורמט שה-Autocomplete שלך מצפה
            const out = matches.map((m) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                const t = m.term;
                const c = (_a = countsByTerm.get(t.id)) !== null && _a !== void 0 ? _a : { up: 0, down: 0 };
                const textLang = (_g = (_e = (_c = (_b = t.translations.find((x) => x.lang === args.lang)) === null || _b === void 0 ? void 0 : _b.text) !== null && _c !== void 0 ? _c : (_d = t.translations.find((x) => x.lang === "en")) === null || _d === void 0 ? void 0 : _d.text) !== null && _e !== void 0 ? _e : (_f = t.translations[0]) === null || _f === void 0 ? void 0 : _f.text) !== null && _g !== void 0 ? _g : m.text;
                const d = args.userId ? myDefaultsByTerm.get(t.id) : null;
                return {
                    id: t.id,
                    text: textLang,
                    normalized: m.normalized, // ✅ חשוב ל-rank
                    status: t.status,
                    upCount: c.up,
                    downCount: c.down,
                    myVote: args.userId ? ((_h = myVoteByTerm.get(t.id)) !== null && _h !== void 0 ? _h : null) : null,
                    // ✅ defaults *פר משתמש*
                    category: (_j = d === null || d === void 0 ? void 0 : d.category) !== null && _j !== void 0 ? _j : null,
                    unit: unitToApi(d === null || d === void 0 ? void 0 : d.unit),
                    qty: (_k = d === null || d === void 0 ? void 0 : d.qty) !== null && _k !== void 0 ? _k : null,
                    extras: (_l = d === null || d === void 0 ? void 0 : d.extras) !== null && _l !== void 0 ? _l : null,
                    imageUrl: (_m = t.imageUrl) !== null && _m !== void 0 ? _m : null, // ✅ הוסף
                };
            });
            // ✅ דירוג: startsWith קודם, ואז status, ואז score, ואז אלפביתי
            out.sort((a, b) => {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                const aStarts = String((_a = a.normalized) !== null && _a !== void 0 ? _a : "").startsWith(qNorm) ? 1 : 0;
                const bStarts = String((_b = b.normalized) !== null && _b !== void 0 ? _b : "").startsWith(qNorm) ? 1 : 0;
                if (aStarts !== bStarts)
                    return bStarts - aStarts;
                const rank = (s) => s === TermStatus.APPROVED
                    ? 3
                    : s === TermStatus.LIVE
                        ? 2
                        : s === TermStatus.PENDING
                            ? 1
                            : 0;
                const ra = rank(a.status);
                const rb = rank(b.status);
                if (ra !== rb)
                    return rb - ra;
                const sa = ((_c = a.upCount) !== null && _c !== void 0 ? _c : 0) - ((_d = a.downCount) !== null && _d !== void 0 ? _d : 0);
                const sb = ((_e = b.upCount) !== null && _e !== void 0 ? _e : 0) - ((_f = b.downCount) !== null && _f !== void 0 ? _f : 0);
                if (sa !== sb)
                    return sb - sa;
                return String((_g = a.text) !== null && _g !== void 0 ? _g : "").localeCompare(String((_h = b.text) !== null && _h !== void 0 ? _h : ""));
            });
            // ✅ unique by id + limit
            const seen = new Set();
            const uniq = [];
            for (const x of out) {
                if (seen.has(x.id))
                    continue;
                seen.add(x.id);
                uniq.push(x);
                if (uniq.length >= args.limit)
                    break;
            }
            return uniq;
        });
    }
    // ---- Create term + translations ----
    createTerm(args) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            // ✅ מניעת כפולים:
            // אם כבר קיימת תרגום זהה (lang+normalized) לטֶרם גלובלי LIVE/APPROVED -> נחזיר אותו במקום ליצור חדש
            const first = args.translations[0];
            const existing = yield this.prisma.termTranslation.findFirst({
                where: {
                    lang: first.lang,
                    normalized: first.normalized,
                    term: {
                        scope: args.scope,
                        status: { in: [TermStatus.LIVE, TermStatus.APPROVED] },
                    },
                },
                select: { termId: true },
            });
            if (existing === null || existing === void 0 ? void 0 : existing.termId) {
                const found = yield this.findTermById(existing.termId);
                if (found)
                    return found;
            }
            return this.prisma.term.create({
                data: {
                    scope: args.scope,
                    ownerUserId: (_a = args.ownerUserId) !== null && _a !== void 0 ? _a : null,
                    status: args.status,
                    defaultCategory: (_b = args.defaultCategory) !== null && _b !== void 0 ? _b : null,
                    imageUrl: (_c = args.imageUrl) !== null && _c !== void 0 ? _c : null, // ✅ הוסף
                    defaultUnit: (_d = args.defaultUnit) !== null && _d !== void 0 ? _d : null,
                    defaultQty: (_e = args.defaultQty) !== null && _e !== void 0 ? _e : null,
                    defaultExtras: (_f = args.defaultExtras) !== null && _f !== void 0 ? _f : null,
                    translations: { create: args.translations },
                },
                include: { translations: true },
            });
        });
    }
    setTermImage(termId, imageUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.term.update({
                where: { id: termId },
                data: { imageUrl },
            });
        });
    }
    addTranslation(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.termTranslation.create({
                data: {
                    termId: args.termId,
                    lang: args.lang,
                    text: args.text,
                    normalized: args.normalized,
                    source: args.source,
                },
            });
        });
    }
    upsertMyDefaults(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.termUserDefaults.upsert({
                where: {
                    userId_termId: { userId: args.userId, termId: args.termId },
                },
                update: {
                    category: args.category,
                    unit: args.unit,
                    qty: args.qty,
                    extras: args.extras,
                },
                create: {
                    userId: args.userId,
                    termId: args.termId,
                    category: args.category,
                    unit: args.unit,
                    qty: args.qty,
                    extras: args.extras,
                },
            });
        });
    }
    findTermById(termId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.term.findUnique({
                where: { id: termId },
                include: { translations: true },
            });
        });
    }
    // ---- Vote ----
    upsertVote(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.termVote.upsert({
                where: { termId_userId: { termId: args.termId, userId: args.userId } },
                update: { vote: args.vote },
                create: { termId: args.termId, userId: args.userId, vote: args.vote },
            });
        });
    }
    getVoteCounts(termId) {
        return __awaiter(this, void 0, void 0, function* () {
            const grouped = yield this.prisma.termVote.groupBy({
                by: ["vote"],
                where: { termId },
                _count: { _all: true },
            });
            let up = 0;
            let down = 0;
            for (const g of grouped) {
                if (g.vote === VoteValue.UP)
                    up = g._count._all;
                if (g.vote === VoteValue.DOWN)
                    down = g._count._all;
            }
            return { up, down };
        });
    }
    updateTermStatus(termId, status, approvedAt) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.term.update({
                where: { id: termId },
                data: { status, approvedAt: approvedAt !== null && approvedAt !== void 0 ? approvedAt : undefined },
            });
        });
    }
};
TermsRepoPrisma = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], TermsRepoPrisma);
export { TermsRepoPrisma };
//# sourceMappingURL=terms.repo.prisma.js.map