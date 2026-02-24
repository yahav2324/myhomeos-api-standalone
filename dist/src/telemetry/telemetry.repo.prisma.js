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
exports.TelemetryRepoPrisma = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TelemetryRepoPrisma = class TelemetryRepoPrisma {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async append(p) {
        await this.prisma.telemetryEvent.create({
            data: {
                boxId: p.boxId,
                quantity: p.quantity,
                percent: p.percent,
                state: p.state,
                timestamp: new Date(p.timestamp),
            },
        });
    }
    async list(boxId, sinceIso) {
        const since = sinceIso ? new Date(sinceIso) : undefined;
        const rows = await this.prisma.telemetryEvent.findMany({
            where: {
                boxId,
                ...(since ? { timestamp: { gte: since } } : {}),
            },
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
    }
};
exports.TelemetryRepoPrisma = TelemetryRepoPrisma;
exports.TelemetryRepoPrisma = TelemetryRepoPrisma = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TelemetryRepoPrisma);
//# sourceMappingURL=telemetry.repo.prisma.js.map