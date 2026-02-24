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
exports.ShoppingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ShoppingService = class ShoppingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listLists(householdId) {
        const rows = await this.prisma.shoppingList.findMany({
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
    }
    async createList(householdId, body) {
        const name = (body?.name ?? '').trim();
        if (!name)
            throw new common_1.BadRequestException('name is required');
        const row = await this.prisma.shoppingList.create({
            data: { householdId, name },
            select: { id: true, name: true, createdAt: true, updatedAt: true },
        });
        return { ok: true, data: row };
    }
    async renameList(householdId, listId, body) {
        const name = (body?.name ?? '').trim();
        if (!name)
            throw new common_1.BadRequestException('name is required');
        await this.assertListOwned(householdId, listId);
        const row = await this.prisma.shoppingList.update({
            where: { id: listId },
            data: { name },
            select: { id: true, name: true, createdAt: true, updatedAt: true },
        });
        return { ok: true, data: row };
    }
    async deleteList(householdId, listId) {
        await this.assertListOwned(householdId, listId);
        await this.prisma.shoppingList.delete({ where: { id: listId } });
        return { ok: true };
    }
    async listItems(householdId, listId) {
        await this.assertListOwned(householdId, listId);
        const rows = await this.prisma.shoppingItem.findMany({
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
                imageUrl: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return { ok: true, data: rows };
    }
    async addItem(householdId, listId, body) {
        await this.assertListOwned(householdId, listId);
        const text = (body?.text ?? '').trim();
        if (!text)
            throw new common_1.BadRequestException('text is required');
        const termId = body.termId ? String(body.termId) : null;
        const qty = this.safeQty(body.qty);
        const unit = this.toPrismaUnit(body.unit);
        const category = body.category ?? null;
        const extra = body.extra ?? null;
        const imageUrlRaw = body?.imageUrl;
        const imageUrl = imageUrlRaw === undefined || imageUrlRaw === null ? null : String(imageUrlRaw).trim() || null;
        const normalizedText = normalize(text);
        const dedupeKey = makeDedupeKey(text, termId);
        let row;
        try {
            row = await this.prisma.shoppingItem.create({
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
                    termId: true,
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
            if (e?.code === 'P2002') {
                row = await this.prisma.shoppingItem.update({
                    where: { listId_dedupeKey: { listId, dedupeKey } },
                    data: { qty, unit, category, extra, imageUrl },
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
        await this.prisma.shoppingList.update({
            where: { id: listId },
            data: { updatedAt: new Date() },
            select: { id: true },
        });
        return { ok: true, data: row };
    }
    async updateItem(householdId, listId, itemId, body) {
        await this.assertListOwned(householdId, listId);
        await this.assertItemInList(listId, itemId);
        const data = {};
        if (body.text !== undefined) {
            const t = String(body.text).trim();
            if (!t)
                throw new common_1.BadRequestException('text cannot be empty');
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
            data.category = body.category === null ? null : body.category;
        }
        if (body.extra !== undefined) {
            data.extra = body.extra === null ? null : body.extra;
        }
        if (body.imageUrl !== undefined) {
            const v = body.imageUrl === null ? '' : String(body.imageUrl);
            const trimmed = v.trim();
            data.imageUrl = trimmed.length ? trimmed : null;
        }
        const row = await this.prisma.shoppingItem.update({
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
        await this.prisma.shoppingList.update({
            where: { id: listId },
            data: { updatedAt: new Date() },
            select: { id: true },
        });
        return { ok: true, data: row };
    }
    async deleteItem(householdId, listId, itemId) {
        await this.assertListOwned(householdId, listId);
        await this.assertItemInList(listId, itemId);
        await this.prisma.shoppingItem.delete({ where: { id: itemId } });
        await this.prisma.shoppingList.update({
            where: { id: listId },
            data: { updatedAt: new Date() },
            select: { id: true },
        });
        return { ok: true };
    }
    async assertListOwned(householdId, listId) {
        const exists = await this.prisma.shoppingList.findFirst({
            where: { id: listId, householdId },
            select: { id: true },
        });
        if (!exists)
            throw new common_1.NotFoundException('ShoppingList not found');
    }
    async assertItemInList(listId, itemId) {
        const exists = await this.prisma.shoppingItem.findFirst({
            where: { id: itemId, listId },
            select: { id: true },
        });
        if (!exists)
            throw new common_1.NotFoundException('ShoppingItem not found in list');
    }
    safeQty(q) {
        const n = Number(q);
        if (!Number.isFinite(n) || n <= 0)
            return 1;
        return Math.round(n * 100) / 100;
    }
    toPrismaUnit(u) {
        const x = String(u ?? '')
            .trim()
            .toUpperCase();
        if (x === 'PCS')
            return client_1.ShoppingUnit.PCS;
        if (x === 'G')
            return client_1.ShoppingUnit.G;
        if (x === 'KG')
            return client_1.ShoppingUnit.KG;
        if (x === 'ML')
            return client_1.ShoppingUnit.ML;
        if (x === 'L')
            return client_1.ShoppingUnit.L;
        return client_1.ShoppingUnit.PCS;
    }
    async importGuestData(householdId, body) {
        const lists = Array.isArray(body?.lists) ? body.lists : [];
        const listIdMap = {};
        const itemIdMap = {};
        for (const l of lists) {
            const name = String(l?.name ?? '').trim() || 'Shopping List';
            const listLocalId = String(l?.listLocalId ?? '');
            if (!listLocalId)
                continue;
            const createdList = await this.prisma.shoppingList.create({
                data: { householdId, name },
                select: { id: true },
            });
            listIdMap[listLocalId] = createdList.id;
            const items = Array.isArray(l?.items) ? l.items : [];
            for (const it of items) {
                const itemLocalId = String(it?.itemLocalId ?? '');
                if (!itemLocalId)
                    continue;
                const imageUrlRaw = it?.imageUrl;
                const imageUrl = imageUrlRaw == null ? null : String(imageUrlRaw).trim() || null;
                const text = String(it?.text ?? '').trim();
                if (!text)
                    continue;
                const termId = it?.termId ? String(it.termId) : null;
                const qty = this.safeQty(it?.qty);
                const unit = this.toPrismaUnit(it?.unit);
                const checked = Boolean(it?.checked ?? false);
                const category = it?.category ?? null;
                const extra = it?.extra ?? null;
                const normalizedText = normalize(text);
                const dedupeKey = makeDedupeKey(text, termId);
                let row;
                try {
                    row = await this.prisma.shoppingItem.create({
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
                    if (e?.code === 'P2002') {
                        row = await this.prisma.shoppingItem.findFirst({
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
            await this.prisma.shoppingList.update({
                where: { id: createdList.id },
                data: { updatedAt: new Date() },
                select: { id: true },
            });
        }
        return { ok: true, data: { listIdMap, itemIdMap } };
    }
};
exports.ShoppingService = ShoppingService;
exports.ShoppingService = ShoppingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShoppingService);
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