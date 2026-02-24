import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VoteValue } from '@prisma/client';
let AdminTermsRepoPrisma = class AdminTermsRepoPrisma {
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(args) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const where = { status: args.status, scope: 'GLOBAL' };
            if ((_a = args.q) === null || _a === void 0 ? void 0 : _a.trim()) {
                where.translations = {
                    some: { lang: args.lang, normalized: { contains: args.q.trim().toLowerCase() } },
                };
            }
            const rows = yield this.prisma.term.findMany(Object.assign(Object.assign({ where, take: args.limit }, (args.cursor ? { skip: 1, cursor: { id: args.cursor } } : {})), { include: { translations: true }, orderBy: { updatedAt: 'desc' } }));
            const nextCursor = rows.length === args.limit ? rows[rows.length - 1].id : null;
            return { rows, nextCursor };
        });
    }
    voteCounts(termId) {
        return __awaiter(this, void 0, void 0, function* () {
            const grouped = yield this.prisma.termVote.groupBy({
                by: ['vote'],
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
    getTerm(termId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.term.findUnique({ where: { id: termId }, include: { translations: true } });
        });
    }
    approve(termId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.term.update({
                where: { id: termId },
                data: { approvedByAdmin: true, status: 'APPROVED', approvedAt: new Date() },
            });
        });
    }
    reject(termId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.term.update({
                where: { id: termId },
                data: { approvedByAdmin: false, status: 'REJECTED', approvedAt: null },
            });
        });
    }
    remove(termId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.term.delete({ where: { id: termId } });
        });
    }
};
AdminTermsRepoPrisma = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], AdminTermsRepoPrisma);
export { AdminTermsRepoPrisma };
//# sourceMappingURL=admin-terms.repo.prisma.js.map