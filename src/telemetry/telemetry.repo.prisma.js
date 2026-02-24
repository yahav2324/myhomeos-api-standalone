import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
let TelemetryRepoPrisma = class TelemetryRepoPrisma {
    constructor(prisma) {
        this.prisma = prisma;
    }
    append(p) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prisma.telemetryEvent.create({
                data: {
                    boxId: p.boxId,
                    quantity: p.quantity,
                    percent: p.percent,
                    state: p.state,
                    timestamp: new Date(p.timestamp),
                },
            });
        });
    }
    list(boxId, sinceIso) {
        return __awaiter(this, void 0, void 0, function* () {
            const since = sinceIso ? new Date(sinceIso) : undefined;
            const rows = yield this.prisma.telemetryEvent.findMany({
                where: Object.assign({ boxId }, (since ? { timestamp: { gte: since } } : {})),
                orderBy: { timestamp: 'asc' },
                take: 5000,
            });
            return rows.map((r) => ({
                boxId: r.boxId,
                quantity: r.quantity,
                percent: r.percent,
                state: r.state,
                timestamp: r.timestamp.toISOString(),
            }));
        });
    }
};
TelemetryRepoPrisma = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], TelemetryRepoPrisma);
export { TelemetryRepoPrisma };
//# sourceMappingURL=telemetry.repo.prisma.js.map