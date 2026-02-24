import { __awaiter, __decorate, __metadata } from "tslib";
// apps/api/src/shopping/shopping.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShoppingUnit } from '@prisma/client';
let ShoppingService = class ShoppingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    // ===== Lists =====
    listLists(householdId) {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield this.prisma.shoppingList.findMany({
                where: { householdId },
                orderBy: { updatedAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    updatedAt: true,
                    createdAt: true,
                },
            });
            return { ok: true, data: rows };
        });
    }
    createList(householdId, body) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const name = ((_a = body === null || body === void 0 ? void 0 : body.name) !== null && _a !== void 0 ? _a : '').trim();
            if (!name)
                throw new BadRequestException('name is required');
            const row = yield this.prisma.shoppingList.create({
                data: { householdId, name },
                select: { id: true, name: true, createdAt: true, updatedAt: true },
            });
            return { ok: true, data: row };
        });
    }
    renameList(householdId, listId, body) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const name = ((_a = body === null || body === void 0 ? void 0 : body.name) !== null && _a !== void 0 ? _a : '').trim();
            if (!name)
                throw new BadRequestException('name is required');
            yield this.assertListOwned(householdId, listId);
            const row = yield this.prisma.shoppingList.update({
                where: { id: listId },
                data: { name },
                select: { id: true, name: true, createdAt: true, updatedAt: true },
            });
            return { ok: true, data: row };
        });
    }
    deleteList(householdId, listId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.assertListOwned(householdId, listId);
            yield this.prisma.shoppingList.delete({ where: { id: listId } }); // cascade items
            return { ok: true };
        });
    }
    // ===== Items =====
    listItems(householdId, listId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.assertListOwned(householdId, listId);
            const rows = yield this.prisma.shoppingItem.findMany({
                where: { listId },
                orderBy: [{ checked: 'asc' }, { updatedAt: 'desc' }],
                select: {
                    id: true,
                    termId: true,
                    text: true,
                    qty: true,
                    unit: true,
                    checked: true,
                    category: true,
                    extra: true,
                    imageUrl: true, // ✅
                    createdAt: true,
                    updatedAt: true,
                },
            });
            return { ok: true, data: rows };
        });
    }
    addItem(householdId, listId, body) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            yield this.assertListOwned(householdId, listId);
            const text = ((_a = body === null || body === void 0 ? void 0 : body.text) !== null && _a !== void 0 ? _a : '').trim();
            if (!text)
                throw new BadRequestException('text is required');
            const termId = body.termId ? String(body.termId) : null;
            const qty = this.safeQty(body.qty);
            const unit = this.toPrismaUnit(body.unit);
            const category = (_b = body.category) !== null && _b !== void 0 ? _b : null;
            const extra = (_c = body.extra) !== null && _c !== void 0 ? _c : null;
            const imageUrlRaw = body === null || body === void 0 ? void 0 : body.imageUrl;
            const imageUrl = imageUrlRaw === undefined || imageUrlRaw === null ? null : String(imageUrlRaw).trim() || null;
            const normalizedText = normalize(text);
            const dedupeKey = makeDedupeKey(text, termId);
            // ✅ ניסיון ליצור; אם כבר קיים (unique) נחזיר את הקיים
            let row;
            try {
                row = yield this.prisma.shoppingItem.create({
                    data: {
                        listId,
                        termId,
                        imageUrl,
                        text,
                        normalizedText,
                        dedupeKey,
                        qty,
                        unit,
                        category,
                        extra,
                    },
                    select: {
                        id: true,
                        termId: true, // ✅ מומלץ להחזיר ללקוח
                        text: true,
                        qty: true,
                        imageUrl: true,
                        unit: true,
                        checked: true,
                        category: true,
                        extra: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                });
            }
            catch (e) {
                // Prisma unique violation
                if ((e === null || e === void 0 ? void 0 : e.code) === 'P2002') {
                    row = yield this.prisma.shoppingItem.update({
                        where: { listId_dedupeKey: { listId, dedupeKey } }, // דורש unique composite בשם כזה בפריזמה
                        data: { qty, unit, category, extra, imageUrl }, // ✅
                        select: {
                            id: true,
                            termId: true,
                            text: true,
                            imageUrl: true,
                            qty: true,
                            unit: true,
                            checked: true,
                            category: true,
                            extra: true,
                            createdAt: true,
                            updatedAt: true,
                        },
                    });
                }
                else
                    throw e;
            }
            // bump list updatedAt
            yield this.prisma.shoppingList.update({
                where: { id: listId },
                data: { updatedAt: new Date() },
                select: { id: true },
            });
            return { ok: true, data: row };
        });
    }
    updateItem(householdId, listId, itemId, body) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.assertListOwned(householdId, listId);
            yield this.assertItemInList(listId, itemId);
            const data = {};
            if (body.text !== undefined) {
                const t = String(body.text).trim();
                if (!t)
                    throw new BadRequestException('text cannot be empty');
                data.text = t;
                data.normalizedText = normalize(t);
            }
            if (body.qty !== undefined)
                data.qty = this.safeQty(body.qty);
            if (body.unit !== undefined)
                data.unit = this.toPrismaUnit(body.unit);
            if (body.checked !== undefined)
                data.checked = Boolean(body.checked);
            if (body.category !== undefined) {
                // allow null to clear
                data.category = body.category === null ? null : body.category;
            }
            if (body.extra !== undefined) {
                data.extra = body.extra === null ? null : body.extra;
            }
            if (body.imageUrl !== undefined) {
                const v = body.imageUrl === null ? '' : String(body.imageUrl);
                const trimmed = v.trim();
                data.imageUrl = trimmed.length ? trimmed : null; // "" => null (הסרה)
            }
            const row = yield this.prisma.shoppingItem.update({
                where: { id: itemId },
                data,
                select: {
                    id: true,
                    text: true,
                    qty: true,
                    unit: true,
                    checked: true,
                    category: true,
                    extra: true,
                    imageUrl: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            // bump list updatedAt
            yield this.prisma.shoppingList.update({
                where: { id: listId },
                data: { updatedAt: new Date() },
                select: { id: true },
            });
            return { ok: true, data: row };
        });
    }
    deleteItem(householdId, listId, itemId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.assertListOwned(householdId, listId);
            yield this.assertItemInList(listId, itemId);
            yield this.prisma.shoppingItem.delete({ where: { id: itemId } });
            // bump list updatedAt
            yield this.prisma.shoppingList.update({
                where: { id: listId },
                data: { updatedAt: new Date() },
                select: { id: true },
            });
            return { ok: true };
        });
    }
    // ===== helpers =====
    assertListOwned(householdId, listId) {
        return __awaiter(this, void 0, void 0, function* () {
            const exists = yield this.prisma.shoppingList.findFirst({
                where: { id: listId, householdId },
                select: { id: true },
            });
            if (!exists)
                throw new NotFoundException('ShoppingList not found');
        });
    }
    assertItemInList(listId, itemId) {
        return __awaiter(this, void 0, void 0, function* () {
            const exists = yield this.prisma.shoppingItem.findFirst({
                where: { id: itemId, listId },
                select: { id: true },
            });
            if (!exists)
                throw new NotFoundException('ShoppingItem not found in list');
        });
    }
    safeQty(q) {
        const n = Number(q);
        if (!Number.isFinite(n) || n <= 0)
            return 1;
        return Math.round(n * 100) / 100;
    }
    toPrismaUnit(u) {
        const x = String(u !== null && u !== void 0 ? u : '')
            .trim()
            .toUpperCase();
        if (x === 'PCS')
            return ShoppingUnit.PCS;
        if (x === 'G')
            return ShoppingUnit.G;
        if (x === 'KG')
            return ShoppingUnit.KG;
        if (x === 'ML')
            return ShoppingUnit.ML;
        if (x === 'L')
            return ShoppingUnit.L;
        return ShoppingUnit.PCS;
    }
    importGuestData(householdId, body) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            const lists = Array.isArray(body === null || body === void 0 ? void 0 : body.lists) ? body.lists : [];
            const listIdMap = {};
            const itemIdMap = {};
            for (const l of lists) {
                const name = String((_a = l === null || l === void 0 ? void 0 : l.name) !== null && _a !== void 0 ? _a : '').trim() || 'Shopping List';
                const listLocalId = String((_b = l === null || l === void 0 ? void 0 : l.listLocalId) !== null && _b !== void 0 ? _b : '');
                if (!listLocalId)
                    continue;
                // Create new list in this household (simple). If you want dedupe by name, you can.
                const createdList = yield this.prisma.shoppingList.create({
                    data: { householdId, name },
                    select: { id: true },
                });
                listIdMap[listLocalId] = createdList.id;
                const items = Array.isArray(l === null || l === void 0 ? void 0 : l.items) ? l.items : [];
                for (const it of items) {
                    const itemLocalId = String((_c = it === null || it === void 0 ? void 0 : it.itemLocalId) !== null && _c !== void 0 ? _c : '');
                    if (!itemLocalId)
                        continue;
                    const imageUrlRaw = it === null || it === void 0 ? void 0 : it.imageUrl;
                    const imageUrl = imageUrlRaw == null ? null : String(imageUrlRaw).trim() || null;
                    const text = String((_d = it === null || it === void 0 ? void 0 : it.text) !== null && _d !== void 0 ? _d : '').trim();
                    if (!text)
                        continue;
                    const termId = (it === null || it === void 0 ? void 0 : it.termId) ? String(it.termId) : null;
                    const qty = this.safeQty(it === null || it === void 0 ? void 0 : it.qty);
                    const unit = this.toPrismaUnit(it === null || it === void 0 ? void 0 : it.unit);
                    const checked = Boolean((_e = it === null || it === void 0 ? void 0 : it.checked) !== null && _e !== void 0 ? _e : false);
                    const category = (_f = it === null || it === void 0 ? void 0 : it.category) !== null && _f !== void 0 ? _f : null;
                    const extra = (_g = it === null || it === void 0 ? void 0 : it.extra) !== null && _g !== void 0 ? _g : null;
                    const normalizedText = normalize(text);
                    const dedupeKey = makeDedupeKey(text, termId);
                    // Create with dedupe (same as addItem)
                    let row;
                    try {
                        row = yield this.prisma.shoppingItem.create({
                            data: {
                                listId: createdList.id,
                                termId,
                                text,
                                normalizedText,
                                dedupeKey,
                                qty,
                                unit,
                                checked,
                                category,
                                extra,
                                imageUrl,
                            },
                            select: { id: true },
                        });
                    }
                    catch (e) {
                        if ((e === null || e === void 0 ? void 0 : e.code) === 'P2002') {
                            row = yield this.prisma.shoppingItem.findFirst({
                                where: { listId: createdList.id, dedupeKey },
                                select: { id: true },
                            });
                            if (!row)
                                throw e;
                        }
                        else {
                            throw e;
                        }
                    }
                    itemIdMap[itemLocalId] = row.id;
                }
                // bump list
                yield this.prisma.shoppingList.update({
                    where: { id: createdList.id },
                    data: { updatedAt: new Date() },
                    select: { id: true },
                });
            }
            return { ok: true, data: { listIdMap, itemIdMap } };
        });
    }
};
ShoppingService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], ShoppingService);
export { ShoppingService };
function normalize(s) {
    return s.trim().toLowerCase();
}
function makeDedupeKey(text, termId) {
    if (termId) {
        return `${termId}`;
    }
    return normalize(text);
}
//# sourceMappingURL=shopping.service.js.map