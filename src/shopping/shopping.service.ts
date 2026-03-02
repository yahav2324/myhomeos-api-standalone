// apps/api/src/shopping/shopping.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ShoppingCategory } from "@smart-kitchen/contracts";
import { ShoppingUnit } from "@prisma/client";

type ApiUnit = "PCS" | "G" | "KG" | "ML" | "L";

@Injectable()
export class ShoppingService {
  constructor(private readonly prisma: PrismaService) {}

  // ===== Lists =====

  async listLists(householdId: string) {
    const rows = await this.prisma.shoppingList.findMany({
      where: { householdId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    return { ok: true, data: rows };
  }

  async createList(householdId: string, body: { name: string }) {
    const name = (body?.name ?? "").trim();
    if (!name) throw new BadRequestException("name is required");

    const row = await this.prisma.shoppingList.create({
      data: { householdId, name },
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    });

    return { ok: true, data: row };
  }

  async renameList(
    householdId: string,
    listId: string,
    body: { name: string },
  ) {
    const name = (body?.name ?? "").trim();
    if (!name) throw new BadRequestException("name is required");

    await this.assertListOwned(householdId, listId);

    const row = await this.prisma.shoppingList.update({
      where: { id: listId },
      data: { name },
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    });

    return { ok: true, data: row };
  }

  async deleteList(householdId: string, listId: string) {
    await this.assertListOwned(householdId, listId);

    await this.prisma.shoppingList.delete({ where: { id: listId } }); // cascade items
    return { ok: true };
  }

  // ===== Items =====

  async listItems(householdId: string, listId: string) {
    await this.assertListOwned(householdId, listId);

    const rows = await this.prisma.shoppingItem.findMany({
      where: { listId },
      orderBy: [{ checked: "asc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        termId: true,
        brandName: true,
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

  async addItem(
    householdId: string,
    listId: string,
    body: {
      text: string;
      termId?: string;
      brandName?: string | null;
      qty?: number;
      category?: ShoppingCategory;
      unit?: ApiUnit;
      extra?: any;
      imageUrl?: string | null;
    },
    userId: string,
  ) {
    await this.assertListOwned(householdId, listId);

    const text = (body?.text ?? "").trim();
    if (!text) throw new BadRequestException("text is required");

    const termId = body.termId ? String(body.termId) : null;
    const brandName = body.brandName?.trim() || null;

    const qty = this.safeQty(body.qty);
    const unit = this.toPrismaUnit(body.unit);
    const category = body.category ?? null;
    const extra = body.extra ? { ...body.extra } : {};
    if (extra.brand) delete extra.brand;
    const imageUrlRaw = body?.imageUrl;
    const imageUrl =
      imageUrlRaw === undefined || imageUrlRaw === null
        ? null
        : String(imageUrlRaw).trim() || null;

    const normalizedText = normalize(text);
    const dedupeKey = makeDedupeKey(text, termId, brandName);
    let row;
    const itemData: any = {
      list: { connect: { id: listId } },
      text,
      normalizedText,
      dedupeKey,
      qty,
      unit,
      category,
      brandName,
      imageUrl,
      extra: Object.keys(extra).length ? extra : null,
    };

    // ✅ רק אם באמת יש termId, נוסיף אותו לאובייקט
    if (termId) {
      itemData.termId = termId;
    }
    try {
      row = await this.prisma.shoppingItem.create({
        data: itemData,
        select: {
          id: true,
          termId: true,
          brandName: true,
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
    } catch (e: any) {
      // Prisma unique violation
      if (e?.code === "P2002") {
        row = await this.prisma.shoppingItem.update({
          where: { listId_dedupeKey: { listId, dedupeKey } },
          data: itemData,
          select: {
            id: true,
            termId: true,
            text: true,
            imageUrl: true,
            brandName: true,
            qty: true,
            unit: true,
            checked: true,
            category: true,
            extra: true,
            createdAt: true,
            updatedAt: true,
          },
        });
      } else throw e;
    }

    if (row.termId && row.brandName) {
      await this.prisma.termUserDefaults.upsert({
        where: {
          userId_termId: { userId, termId: row.termId },
        },
        update: { brandName: row.brandName },
        create: {
          userId,
          termId: row.termId,
          brandName: row.brandName,
        },
      });
    }
    // bump list updatedAt
    await this.prisma.shoppingList.update({
      where: { id: listId },
      data: { updatedAt: new Date() },
      select: { id: true },
    });

    return { ok: true, data: row };
  }

  async updateItem(
    userId: string, // ✅ נוסף userId כדי לעדכן העדפות
    householdId: string,
    listId: string,
    itemId: string,
    body: {
      text?: string;
      qty?: number;
      brandName?: string | null;
      unit?: ApiUnit;
      category?: ShoppingCategory | null;
      extra?: any | null;
      checked?: boolean;
      imageUrl?: string | null;
    },
  ) {
    await this.assertListOwned(householdId, listId);
    await this.assertItemInList(listId, itemId);

    const data: any = {};

    if (body.text !== undefined) {
      const t = String(body.text).trim();
      if (!t) throw new BadRequestException("text cannot be empty");
      data.text = t;
      data.normalizedText = normalize(t);
    }
    if (body.qty !== undefined) data.qty = this.safeQty(body.qty);
    if (body.unit !== undefined) data.unit = this.toPrismaUnit(body.unit);
    if (body.checked !== undefined) data.checked = Boolean(body.checked);

    if (body.category !== undefined) {
      data.category = body.category === null ? null : body.category;
    }
    if (body.brandName !== undefined) {
      data.brandName = body.brandName?.trim() || null;
    }
    if (body.extra !== undefined) {
      const cleanExtra = body.extra ? { ...body.extra } : {};
      if (cleanExtra.brand) delete cleanExtra.brand;
      data.extra = Object.keys(cleanExtra).length ? cleanExtra : null;
    }

    if (body.imageUrl !== undefined) {
      const v = body.imageUrl === null ? "" : String(body.imageUrl);
      const trimmed = v.trim();
      data.imageUrl = trimmed.length ? trimmed : null;
    }

    if (body.text !== undefined || body.brandName !== undefined) {
      const current = await this.prisma.shoppingItem.findUnique({
        where: { id: itemId },
        select: { termId: true, text: true, brandName: true },
      });
      data.dedupeKey = makeDedupeKey(
        body.text ?? current.text,
        current.termId,
        body.brandName !== undefined ? body.brandName : current.brandName,
      );
    }

    const row = await this.prisma.shoppingItem.update({
      where: { id: itemId },
      data,
      select: {
        id: true,
        termId: true,
        brandName: true,
        text: true,
        qty: true,
        unit: true,
        checked: true,
        category: true,
        extra: true,
        imageUrl: true,
      },
    });

    // ✅ עדכון העדפות משתמש (עבור ה-Suggest)
    if (row.termId && row.brandName) {
      await this.prisma.termUserDefaults.upsert({
        where: {
          userId_termId: { userId, termId: row.termId },
        },
        update: {
          brandName: row.brandName,
          category: row.category,
          imageUrl: row.imageUrl,
        },
        create: {
          userId,
          termId: row.termId,
          brandName: row.brandName,
          category: row.category,
          imageUrl: row.imageUrl,
        },
      });
    }

    // ✅ עדכון תמונת מותג גלובלית (אם הועלתה תמונה)
    if (row.imageUrl && row.termId && row.brandName) {
      await this.prisma.termBrandImage.upsert({
        where: {
          termId_brandName: {
            termId: row.termId,
            brandName: normalize(row.brandName),
          },
        },
        update: { imageUrl: row.imageUrl },
        create: {
          termId: row.termId,
          brandName: normalize(row.brandName),
          imageUrl: row.imageUrl,
        },
      });
    }

    await this.prisma.shoppingList.update({
      where: { id: listId },
      data: { updatedAt: new Date() },
      select: { id: true },
    });

    return { ok: true, data: row };
  }

  async deleteItem(householdId: string, listId: string, itemId: string) {
    await this.assertListOwned(householdId, listId);
    await this.assertItemInList(listId, itemId);

    await this.prisma.shoppingItem.delete({ where: { id: itemId } });

    // bump list updatedAt
    await this.prisma.shoppingList.update({
      where: { id: listId },
      data: { updatedAt: new Date() },
      select: { id: true },
    });

    return { ok: true };
  }

  // ===== helpers =====

  private async assertListOwned(householdId: string, listId: string) {
    const exists = await this.prisma.shoppingList.findFirst({
      where: { id: listId, householdId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException("ShoppingList not found");
  }

  private async assertItemInList(listId: string, itemId: string) {
    const exists = await this.prisma.shoppingItem.findFirst({
      where: { id: itemId, listId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException("ShoppingItem not found in list");
  }

  private safeQty(q?: number) {
    const n = Number(q);
    if (!Number.isFinite(n) || n <= 0) return 1;
    return Math.round(n * 100) / 100;
  }

  private toPrismaUnit(u?: ApiUnit | string): ShoppingUnit {
    const x = String(u ?? "")
      .trim()
      .toUpperCase();

    if (x === "PCS") return ShoppingUnit.PCS;
    if (x === "G") return ShoppingUnit.G;
    if (x === "KG") return ShoppingUnit.KG;
    if (x === "ML") return ShoppingUnit.ML;
    if (x === "L") return ShoppingUnit.L;

    return ShoppingUnit.PCS;
  }

  async importGuestData(
    householdId: string,
    body: { lists: Array<{ listLocalId: string; name: string; items: any[] }> },
  ) {
    const lists = Array.isArray(body?.lists) ? body.lists : [];
    const listIdMap: Record<string, string> = {};
    const itemIdMap: Record<string, string> = {};

    for (const l of lists) {
      const name = String(l?.name ?? "").trim() || "Shopping List";
      const listLocalId = String(l?.listLocalId ?? "");
      if (!listLocalId) continue;

      // Create new list in this household (simple). If you want dedupe by name, you can.
      const createdList = await this.prisma.shoppingList.create({
        data: { householdId, name },
        select: { id: true },
      });

      listIdMap[listLocalId] = createdList.id;

      const items = Array.isArray(l?.items) ? l.items : [];
      for (const it of items) {
        const itemLocalId = String(it?.itemLocalId ?? "");
        if (!itemLocalId) continue;
        const imageUrlRaw = it?.imageUrl;
        const imageUrl =
          imageUrlRaw == null ? null : String(imageUrlRaw).trim() || null;

        const text = String(it?.text ?? "").trim();
        if (!text) continue;

        const termId = it?.termId ? String(it.termId) : null;
        const brandName = it?.brandName?.trim() || null;
        const qty = this.safeQty(it?.qty);
        const unit = this.toPrismaUnit(it?.unit);
        const checked = Boolean(it?.checked ?? false);
        const category = it?.category ?? null;
        const extra = it?.extra ? { ...it.extra } : null;
        if (extra && extra.brand) delete extra.brand;
        const normalizedText = normalize(text);
        const dedupeKey = makeDedupeKey(text, termId, brandName);
        let row: any;
        try {
          row = await this.prisma.shoppingItem.create({
            data: {
              listId: createdList.id,
              termId,
              brandName,
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
        } catch (e: any) {
          if (e?.code === "P2002") {
            row = await this.prisma.shoppingItem.findFirst({
              where: { listId: createdList.id, dedupeKey },
              select: { id: true },
            });
            if (!row) throw e;
          } else {
            throw e;
          }
        }

        itemIdMap[itemLocalId] = row.id;
      }

      // bump list
      await this.prisma.shoppingList.update({
        where: { id: createdList.id },
        data: { updatedAt: new Date() },
        select: { id: true },
      });
    }

    return { ok: true, data: { listIdMap, itemIdMap } };
  }
}

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function makeDedupeKey(
  text: string,
  termId: string | null,
  brandName: string | null,
): string {
  const brand = brandName ? normalize(brandName) : "no_brand";
  if (termId) {
    // עכשיו המפתח הוא שילוב של ה-ID של המוצר והמותג
    return `term_${termId}_${brand}`;
  }
  return `text_${normalize(text)}_${brand}`;
}
