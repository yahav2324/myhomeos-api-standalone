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
exports.AdminTermsRepoPrisma = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AdminTermsRepoPrisma = class AdminTermsRepoPrisma {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(args) {
        const where = { status: args.status, scope: 'GLOBAL' };
        if (args.q?.trim()) {
            where.translations = {
                some: { lang: args.lang, normalized: { contains: args.q.trim().toLowerCase() } },
            };
        }
        const rows = await this.prisma.term.findMany({
            where,
            take: args.limit,
            ...(args.cursor ? { skip: 1, cursor: { id: args.cursor } } : {}),
            include: { translations: true },
            orderBy: { updatedAt: 'desc' },
        });
        const nextCursor = rows.length === args.limit ? rows[rows.length - 1].id : null;
        return { rows, nextCursor };
    }
    async voteCounts(termId) {
        const grouped = await this.prisma.termVote.groupBy({
            by: ['vote'],
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
    async getTerm(termId) {
        return this.prisma.term.findUnique({ where: { id: termId }, include: { translations: true } });
    }
    async approve(termId) {
        return this.prisma.term.update({
            where: { id: termId },
            data: { approvedByAdmin: true, status: 'APPROVED', approvedAt: new Date() },
        });
    }
    async reject(termId) {
        return this.prisma.term.update({
            where: { id: termId },
            data: { approvedByAdmin: false, status: 'REJECTED', approvedAt: null },
        });
    }
    async remove(termId) {
        return this.prisma.term.delete({ where: { id: termId } });
    }
};
exports.AdminTermsRepoPrisma = AdminTermsRepoPrisma;
exports.AdminTermsRepoPrisma = AdminTermsRepoPrisma = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminTermsRepoPrisma);
//# sourceMappingURL=admin-terms.repo.prisma.js.map