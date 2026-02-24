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
exports.BoxesRepoPrisma = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function toContract(row) {
    return {
        id: row.id,
        code: row.code,
        deviceId: row.deviceId,
        name: row.name,
        unit: row.unit,
        capacity: row.capacity ?? undefined,
        fullQuantity: row.fullQuantity ?? undefined,
        quantity: row.quantity,
        percent: row.percent,
        state: row.state,
        householdId: row.householdId,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        lastReadingAt: row.lastReadingAt ? row.lastReadingAt.toISOString() : undefined,
    };
}
let BoxesRepoPrisma = class BoxesRepoPrisma {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByCodeInHousehold(householdId, code) {
        const row = await this.prisma.box.findFirst({
            where: { code, householdId },
        });
        return row ? toContract(row) : null;
    }
    async findAll() {
        const rows = await this.prisma.box.findMany({ orderBy: { createdAt: 'asc' } });
        return rows.map(toContract);
    }
    async findByIdInHousehold(householdId, id) {
        const row = await this.prisma.box.findFirst({
            where: { id, householdId },
        });
        return row ? toContract(row) : null;
    }
    async findAllByHouseholdId(householdId) {
        const rows = await this.prisma.box.findMany({
            where: { householdId },
            orderBy: { updatedAt: 'desc' },
        });
        return rows.map(toContract);
    }
    async findByDeviceIdInHousehold(householdId, deviceId) {
        const row = await this.prisma.box.findFirst({
            where: { householdId, deviceId },
        });
        return row ? toContract(row) : null;
    }
    async findByDeviceId(deviceId) {
        const row = await this.prisma.box.findUnique({ where: { deviceId } });
        return row ? toContract(row) : null;
    }
    async save(box) {
        const row = await this.prisma.box.upsert({
            where: { id: box.id },
            create: {
                id: box.id,
                code: box.code,
                deviceId: box.deviceId,
                name: box.name,
                unit: box.unit,
                capacity: box.capacity ?? null,
                householdId: box.householdId,
                fullQuantity: box.fullQuantity ?? null,
                quantity: box.quantity,
                percent: box.percent,
                state: box.state,
                lastReadingAt: box.lastReadingAt ? new Date(box.lastReadingAt) : null,
                createdAt: new Date(box.createdAt),
            },
            update: {
                name: box.name,
                unit: box.unit,
                capacity: box.capacity ?? null,
                fullQuantity: box.fullQuantity ?? null,
                quantity: box.quantity,
                percent: box.percent,
                state: box.state,
                lastReadingAt: box.lastReadingAt ? new Date(box.lastReadingAt) : null,
            },
        });
        return toContract(row);
    }
    async deleteInHousehold(householdId, id) {
        const res = await this.prisma.box.deleteMany({
            where: { id, householdId },
        });
        return res.count === 1;
    }
};
exports.BoxesRepoPrisma = BoxesRepoPrisma;
exports.BoxesRepoPrisma = BoxesRepoPrisma = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BoxesRepoPrisma);
//# sourceMappingURL=boxes.repo.prisma.js.map