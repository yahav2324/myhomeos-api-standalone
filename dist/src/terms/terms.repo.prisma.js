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
exports.TermsRepoPrisma = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
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
    async getSystemConfig(key) {
        return this.prisma.systemConfig.findUnique({ where: { key } });
    }
    async upsertSystemConfig(key, json) {
        return this.prisma.systemConfig.upsert({
            where: { key },
            update: { json: json },
            create: { key, json: json },
        });
    }
    async suggest(args) {
        const qNorm = (args.qNorm ?? "").trim();
        if (!qNorm)
            return [];
        const baseTermWhere = {
            OR: [
                {
                    scope: client_1.TermScope.GLOBAL,
                    status: { in: [client_1.TermStatus.LIVE, client_1.TermStatus.APPROVED] },
                },
                args.userId
                    ? {
                        scope: client_1.TermScope.PRIVATE,
                        ownerUserId: args.userId,
                        status: {
                            in: [client_1.TermStatus.PENDING, client_1.TermStatus.LIVE, client_1.TermStatus.APPROVED],
                        },
                    }
                    : undefined,
                args.userId
                    ? {
                        scope: client_1.TermScope.GLOBAL,
                        status: client_1.TermStatus.PENDING,
                        ownerUserId: args.userId,
                    }
                    : undefined,
            ].filter(Boolean),
        };
        const starts = await this.prisma.termTranslation.findMany({
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
                        imageUrl: true,
                        approvedByAdmin: true,
                        translations: { select: { lang: true, text: true } },
                    },
                },
            },
            orderBy: [{ normalized: "asc" }],
        });
        const needMore = starts.length < args.limit;
        const contains = needMore && qNorm.length >= 2
            ? await this.prisma.termTranslation.findMany({
                where: {
                    lang: args.lang,
                    normalized: { contains: qNorm },
                    term: baseTermWhere,
                },
                take: args.limit * 12,
                include: {
                    term: {
                        select: {
                            id: true,
                            scope: true,
                            ownerUserId: true,
                            status: true,
                            imageUrl: true,
                            approvedByAdmin: true,
                            translations: { select: { lang: true, text: true } },
                        },
                    },
                },
                orderBy: [{ normalized: "asc" }],
            })
            : [];
        const matches = [...starts, ...contains];
        const termIds = Array.from(new Set(matches.map((m) => m.termId)));
        if (termIds.length === 0)
            return [];
        const myDefaults = args.userId
            ? await this.prisma.termUserDefaults.findMany({
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
        const grouped = await this.prisma.termVote.groupBy({
            by: ["termId", "vote"],
            where: { termId: { in: termIds } },
            _count: { _all: true },
        });
        const countsByTerm = new Map();
        for (const g of grouped) {
            const cur = countsByTerm.get(g.termId) ?? { up: 0, down: 0 };
            if (g.vote === client_1.VoteValue.UP)
                cur.up = g._count._all;
            if (g.vote === client_1.VoteValue.DOWN)
                cur.down = g._count._all;
            countsByTerm.set(g.termId, cur);
        }
        const myVotes = args.userId
            ? await this.prisma.termVote.findMany({
                where: { termId: { in: termIds }, userId: args.userId },
                select: { termId: true, vote: true },
            })
            : [];
        const myVoteByTerm = new Map();
        for (const v of myVotes)
            myVoteByTerm.set(v.termId, v.vote);
        const out = matches.map((m) => {
            const t = m.term;
            const c = countsByTerm.get(t.id) ?? { up: 0, down: 0 };
            const textLang = t.translations.find((x) => x.lang === args.lang)?.text ??
                t.translations.find((x) => x.lang === "en")?.text ??
                t.translations[0]?.text ??
                m.text;
            const d = args.userId ? myDefaultsByTerm.get(t.id) : null;
            return {
                id: t.id,
                text: textLang,
                normalized: m.normalized,
                status: t.status,
                upCount: c.up,
                downCount: c.down,
                myVote: args.userId ? (myVoteByTerm.get(t.id) ?? null) : null,
                category: d?.category ?? null,
                unit: unitToApi(d?.unit),
                qty: d?.qty ?? null,
                extras: d?.extras ?? null,
                imageUrl: t.imageUrl ?? null,
            };
        });
        out.sort((a, b) => {
            const aStarts = String(a.normalized ?? "").startsWith(qNorm) ? 1 : 0;
            const bStarts = String(b.normalized ?? "").startsWith(qNorm) ? 1 : 0;
            if (aStarts !== bStarts)
                return bStarts - aStarts;
            const rank = (s) => s === client_1.TermStatus.APPROVED
                ? 3
                : s === client_1.TermStatus.LIVE
                    ? 2
                    : s === client_1.TermStatus.PENDING
                        ? 1
                        : 0;
            const ra = rank(a.status);
            const rb = rank(b.status);
            if (ra !== rb)
                return rb - ra;
            const sa = (a.upCount ?? 0) - (a.downCount ?? 0);
            const sb = (b.upCount ?? 0) - (b.downCount ?? 0);
            if (sa !== sb)
                return sb - sa;
            return String(a.text ?? "").localeCompare(String(b.text ?? ""));
        });
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
    }
    async createTerm(args) {
        const first = args.translations[0];
        const existing = await this.prisma.termTranslation.findFirst({
            where: {
                lang: first.lang,
                normalized: first.normalized,
                term: {
                    scope: args.scope,
                    status: { in: [client_1.TermStatus.LIVE, client_1.TermStatus.APPROVED] },
                },
            },
            select: { termId: true },
        });
        if (existing?.termId) {
            const found = await this.findTermById(existing.termId);
            if (found)
                return found;
        }
        return this.prisma.term.create({
            data: {
                scope: args.scope,
                ownerUserId: args.ownerUserId ?? null,
                status: args.status,
                defaultCategory: args.defaultCategory ?? null,
                imageUrl: args.imageUrl ?? null,
                defaultUnit: args.defaultUnit ?? null,
                defaultQty: args.defaultQty ?? null,
                defaultExtras: args.defaultExtras ?? null,
                translations: { create: args.translations },
            },
            include: { translations: true },
        });
    }
    async setTermImage(termId, imageUrl) {
        return this.prisma.term.update({
            where: { id: termId },
            data: { imageUrl },
        });
    }
    async addTranslation(args) {
        return this.prisma.termTranslation.create({
            data: {
                termId: args.termId,
                lang: args.lang,
                text: args.text,
                normalized: args.normalized,
                source: args.source,
            },
        });
    }
    async upsertMyDefaults(args) {
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
    }
    async findTermById(termId) {
        return this.prisma.term.findUnique({
            where: { id: termId },
            include: { translations: true },
        });
    }
    async upsertVote(args) {
        return this.prisma.termVote.upsert({
            where: { termId_userId: { termId: args.termId, userId: args.userId } },
            update: { vote: args.vote },
            create: { termId: args.termId, userId: args.userId, vote: args.vote },
        });
    }
    async getVoteCounts(termId) {
        const grouped = await this.prisma.termVote.groupBy({
            by: ["vote"],
            where: { termId },
            _count: { _all: true },
        });
        let up = 0;
        let down = 0;
        for (const g of grouped) {
            if (g.vote === client_1.VoteValue.UP)
                up = g._count._all;
            if (g.vote === client_1.VoteValue.DOWN)
                down = g._count._all;
        }
        return { up, down };
    }
    async updateTermStatus(termId, status, approvedAt) {
        return this.prisma.term.update({
            where: { id: termId },
            data: { status, approvedAt: approvedAt ?? undefined },
        });
    }
};
exports.TermsRepoPrisma = TermsRepoPrisma;
exports.TermsRepoPrisma = TermsRepoPrisma = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TermsRepoPrisma);
//# sourceMappingURL=terms.repo.prisma.js.map