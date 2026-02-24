import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
function toContract(row) {
    var _a, _b;
    return {
        id: row.id,
        code: row.code,
        deviceId: row.deviceId,
        name: row.name,
        unit: row.unit,
        capacity: (_a = row.capacity) !== null && _a !== void 0 ? _a : undefined,
        fullQuantity: (_b = row.fullQuantity) !== null && _b !== void 0 ? _b : undefined,
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
    findByCodeInHousehold(householdId, code) {
        return __awaiter(this, void 0, void 0, function* () {
            const row = yield this.prisma.box.findFirst({
                where: { code, householdId },
            });
            return row ? toContract(row) : null;
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield this.prisma.box.findMany({ orderBy: { createdAt: 'asc' } });
            return rows.map(toContract);
        });
    }
    findByIdInHousehold(householdId, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const row = yield this.prisma.box.findFirst({
                where: { id, householdId },
            });
            return row ? toContract(row) : null;
        });
    }
    findAllByHouseholdId(householdId) {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield this.prisma.box.findMany({
                where: { householdId },
                orderBy: { updatedAt: 'desc' },
            });
            return rows.map(toContract);
        });
    }
    findByDeviceIdInHousehold(householdId, deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const row = yield this.prisma.box.findFirst({
                where: { householdId, deviceId },
            });
            return row ? toContract(row) : null;
        });
    }
    findByDeviceId(deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const row = yield this.prisma.box.findUnique({ where: { deviceId } });
            return row ? toContract(row) : null;
        });
    }
    // ✅ מחזיר את ה-row המעודכן מה-DB (כולל updatedAt אמיתי)
    save(box) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const row = yield this.prisma.box.upsert({
                where: { id: box.id },
                create: {
                    id: box.id,
                    code: box.code,
                    deviceId: box.deviceId,
                    name: box.name,
                    unit: box.unit,
                    capacity: (_a = box.capacity) !== null && _a !== void 0 ? _a : null,
                    householdId: box.householdId,
                    fullQuantity: (_b = box.fullQuantity) !== null && _b !== void 0 ? _b : null,
                    quantity: box.quantity,
                    percent: box.percent,
                    state: box.state,
                    lastReadingAt: box.lastReadingAt ? new Date(box.lastReadingAt) : null,
                    createdAt: new Date(box.createdAt),
                    // updatedAt מנוהל ע"י @updatedAt
                },
                update: {
                    name: box.name,
                    unit: box.unit,
                    capacity: (_c = box.capacity) !== null && _c !== void 0 ? _c : null,
                    fullQuantity: (_d = box.fullQuantity) !== null && _d !== void 0 ? _d : null,
                    quantity: box.quantity,
                    percent: box.percent,
                    state: box.state,
                    lastReadingAt: box.lastReadingAt ? new Date(box.lastReadingAt) : null,
                },
            });
            return toContract(row);
        });
    }
    deleteInHousehold(householdId, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.prisma.box.deleteMany({
                where: { id, householdId },
            });
            return res.count === 1;
        });
    }
};
BoxesRepoPrisma = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], BoxesRepoPrisma);
export { BoxesRepoPrisma };
//# sourceMappingURL=boxes.repo.prisma.js.map