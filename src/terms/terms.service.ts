import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  ShoppingCategory,
  ShoppingUnit,
  TermScope,
  TermStatus,
  VoteValue,
} from "@prisma/client";
import { z } from "zod";
import { TermsRepoPrisma } from "./terms.repo.prisma";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

const CreateTermBodySchema = z.object({
  text: z.string().min(1).max(80),
  lang: z.string().min(2).max(10).optional(),
  scope: z.enum(["GLOBAL", "PRIVATE"]).optional(),
  category: z.nativeEnum(ShoppingCategory).optional(),
  unit: z.nativeEnum(ShoppingUnit).optional(),
  qty: z.number().positive().optional(),
  brandName: z.string().optional().nullable(),
  extras: z.record(z.string(), z.string()).optional(),
  imageUrl: z.string().optional().nullable(),
  defaultCategory: z.nativeEnum(ShoppingCategory).optional(),
  defaultUnit: z.nativeEnum(ShoppingUnit).optional(),
  defaultQty: z.number().positive().optional(),
  defaultExtras: z.record(z.string(), z.string()).optional(),
});

const VoteBodySchema = z.object({
  vote: z.enum(["UP", "DOWN"]),
});

// ---- config types ----
type CatalogConfig = {
  minQueryChars: number;
  upApproveMin: number;
  downRejectMin: number;
};

const DEFAULT_CATALOG_CONFIG: CatalogConfig = {
  minQueryChars: 2,
  upApproveMin: 5,
  downRejectMin: 10,
};

// ---- helpers ----
function normalizeText(s: string) {
  return s.trim().toLowerCase();
}

function detectLang(text: string): string {
  const t = text.trim();
  if (/[֐-׿]/.test(t)) return "he";
  if (/[a-zA-Z]/.test(t)) return "en";
  return "und";
}

// בעתיד: translate provider
async function translateToEnglish(
  text: string,
  fromLang: string,
): Promise<string | null> {
  void text;
  void fromLang;
  return null;
}

@Injectable()
export class TermsService {
  constructor(
    private readonly repo: TermsRepoPrisma,
    private readonly httpService: HttpService,
  ) {}

  async getCatalogConfig(): Promise<CatalogConfig> {
    const row = await this.repo.getSystemConfig("catalog");

    if (!row?.json || typeof row.json !== "object") {
      await this.repo.upsertSystemConfig("catalog", {
        catalog: DEFAULT_CATALOG_CONFIG,
      });
      return DEFAULT_CATALOG_CONFIG;
    }

    const obj = row.json as any;
    const cfg = obj.catalog ?? obj;

    return {
      minQueryChars: Number(
        cfg.minQueryChars ?? DEFAULT_CATALOG_CONFIG.minQueryChars,
      ),
      upApproveMin: Number(
        cfg.upApproveMin ?? DEFAULT_CATALOG_CONFIG.upApproveMin,
      ),
      downRejectMin: Number(
        cfg.downRejectMin ?? DEFAULT_CATALOG_CONFIG.downRejectMin,
      ),
    };
  }

  async findAll(params: {
    limit: number;
    offset: number;
    search?: string;
    userId?: string;
  }) {
    const { limit, offset, search } = params;

    const where = search
      ? {
          translations: {
            some: {
              text: { contains: search, mode: "insensitive" as const },
            },
          },
        }
      : {};

    return this.repo.findAll({ limit, offset, where });
  }

  async setTermImage(
    termId: string,
    imageUrl: string | null,
    userId: string,
    brandName?: string | null, // הוספת הפרמטר החדש
  ) {
    const term = await this.repo.findTermById(termId);
    if (!term) throw new NotFoundException("Term not found");

    // לוגיקת ההרשאות נשארת זהה
    if (term.scope === TermScope.PRIVATE && term.ownerUserId !== userId) {
      throw new BadRequestException(
        "Not authorized to change image of this term",
      );
    }

    // עדכון ה-Repo. שים לב שאנחנו שולחים גם את ה-brandName
    // אם התמונה מגיעה מ-Cloudinary, ה-imageUrl יתחיל ב-https://...
    const updated = await this.repo.upsertMyDefaults({
      termId,
      userId,
      imageUrl,
      brandName: brandName ?? null,
    });

    return { ok: true, data: updated };
  }

  async create(body: unknown, userId: string) {
    const parsed = CreateTermBodySchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());

    const text = parsed.data.text.trim();
    const lang = (
      parsed.data.lang?.trim() ||
      detectLang(text) ||
      "und"
    ).toLowerCase();
    const scope = (parsed.data.scope ?? "GLOBAL") as "GLOBAL" | "PRIVATE";
    const cat = parsed.data.defaultCategory ?? parsed.data.category ?? null;
    const unit = parsed.data.defaultUnit ?? parsed.data.unit ?? null;
    const qty = parsed.data.defaultQty ?? parsed.data.qty ?? null;
    const brandName = parsed.data.brandName?.trim() || null;
    const extras = parsed.data.defaultExtras ?? parsed.data.extras ?? {};
    if (brandName) {
      (extras as any).brand = brandName;
    }
    const imageUrl = parsed.data.imageUrl ?? null;
    const term = await this.repo.createTerm({
      scope: scope === "PRIVATE" ? TermScope.PRIVATE : TermScope.GLOBAL,
      ownerUserId: scope === "PRIVATE" ? userId : null,
      status: scope === "PRIVATE" ? TermStatus.PENDING : TermStatus.LIVE,
      translations: [
        { lang, text, normalized: normalizeText(text), source: "USER" },
      ],
      imageUrl,
      defaultCategory: cat,
      defaultUnit: unit,
      defaultQty: qty,
      defaultExtras: Object.keys(extras).length ? extras : null, // ✅ שליחת ה-Extras המעודכנים
    });

    // Auto translate to English (optional)
    const hasEn = term.translations.some((t) => t.lang === "en");
    if (!hasEn && lang !== "en") {
      try {
        const en = await translateToEnglish(text, lang);
        if (en && en.trim().length > 0) {
          await this.repo.addTranslation({
            termId: term.id,
            lang: "en",
            text: en.trim(),
            normalized: normalizeText(en),
            source: "AUTO",
          });
        }
      } catch {
        // ignore
      }
    }

    const fresh = await this.repo.findTermById(term.id);

    return {
      ok: true,
      data: fresh,
    };
  }

  async upsertMyDefaults(termId: string, body: any, userId: string) {
    // נשתמש ב-any זמנית או נעדכן את ה-Schema ב-Contracts
    const term = await this.repo.findTermById(termId);
    if (!term) throw new NotFoundException("Term not found");

    const d = body; // בדרך כלל מגיע מה-UpsertMyDefaultsSchema

    const row = await this.repo.upsertMyDefaults({
      termId,
      userId,
      category: d.category ?? null,
      unit: d.unit ?? null,
      qty: d.qty ?? null,
      extras: d.extras ?? null,
      imageUrl: d.imageUrl ?? null,
      brandName: d.brandName ?? null,
    });

    return { ok: true, data: row };
  }

  async vote(termId: string, body: unknown, userId: string) {
    const parsed = VoteBodySchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());

    const term = await this.repo.findTermById(termId);
    if (!term) throw new NotFoundException("Term not found");

    // vote upsert
    await this.repo.upsertVote({
      termId,
      userId,
      vote: parsed.data.vote === "UP" ? VoteValue.UP : VoteValue.DOWN,
    });

    const cfg = await this.getCatalogConfig();
    const counts = await this.repo.getVoteCounts(termId);

    let newStatus: TermStatus = term.status;
    let approvedAt: Date | null = term.approvedAt ?? null;

    if (term.approvedByAdmin) {
      newStatus = TermStatus.APPROVED;
      if (!approvedAt) approvedAt = new Date();
    } else if (counts.up >= cfg.upApproveMin) {
      newStatus = TermStatus.APPROVED;
      if (!approvedAt) approvedAt = new Date();
    } else if (counts.down >= cfg.downRejectMin) {
      newStatus = TermStatus.REJECTED;
      approvedAt = null;
    } else {
      // ✅ נשאר LIVE כדי שכולם ימשיכו לראות ולדרג
      // (PENDING שמור למקרה של “ריסאבמיט” בעתיד / או PRIVATE)
      newStatus =
        term.scope === TermScope.PRIVATE ? TermStatus.PENDING : TermStatus.LIVE;
      approvedAt = null;
    }

    const updated = await this.repo.updateTermStatus(
      termId,
      newStatus,
      approvedAt,
    );

    return {
      ok: true,
      data: {
        id: termId,
        status: updated.status,
        approvedAt: updated.approvedAt,
        upCount: counts.up,
        downCount: counts.down,
        myVote: parsed.data.vote,
        thresholds: cfg,
      },
    };
  }

  async delete(termId: string, userId: string) {
    const term = await this.repo.findTermById(termId);
    if (!term) throw new NotFoundException("המונח לא נמצא");

    await this.repo.deleteTerm(termId);
    return { ok: true };
  }

  async suggest(args: {
    q: string;
    lang: string;
    limit: number;
    userId?: string | null;
  }) {
    const cfg = await this.getCatalogConfig();
    const qTrim = args.q.trim();
    if (qTrim.length < cfg.minQueryChars) return [];

    const qNorm = normalizeText(qTrim);
    const lang = (args.lang || "he").toLowerCase();
    const limit = Math.min(Math.max(args.limit || 10, 1), 30);

    const [localResults, externalResults] = await Promise.all([
      this.repo.suggest({ qNorm, lang, limit, userId: args.userId }),
      this.fetchFromOFF(qTrim, limit),
    ]);

    const localNames = new Set(
      localResults.map((item) =>
        normalizeText(item.translations[0]?.text || ""),
      ),
    );

    const combined = [
      ...localResults,
      ...externalResults.filter((ext) => {
        const extName = normalizeText(ext.translations[0]?.text || "");
        return !localNames.has(extName);
      }),
    ];

    return combined.slice(0, limit);
  }

  private async fetchFromOFF(q: string, limit: number) {
    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=${limit}&cc=il`;

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { "User-Agent": "MyHomeOS/1.0 (NestJS Backend)" },
        }),
      );

      const products = response.data?.products || [];

      return products.map((p: any) => ({
        id: `off_${p.code}`,
        imageUrl: p.image_url || p.image_front_url || null,
        scope: "GLOBAL",
        status: "LIVE",
        approvedAt: new Date(),
        translations: [
          {
            id: `trans_off_${p.code}`,
            text:
              p.product_name_he ||
              p.product_name ||
              p.generic_name_he ||
              "מוצר ללא שם",
            lang: p.product_name_he ? "he" : "en",
            normalized: normalizeText(
              p.product_name_he || p.product_name || "",
            ),
            source: "EXTERNAL",
            createdAt: new Date(),
            termId: `off_${p.code}`,
          },
        ],
        defaultCategory: this.mapExternalCategory(p.categories_tags),
        defaultUnit: null,
        defaultQty: 1,
        defaultExtras: {
          barcode: p.code,
          brand: p.brands,
          isExternal: true,
        },
      }));
    } catch (error) {
      console.error("OFF API Error:", error.message);
      return [];
    }
  }

  async handleExternalSelection(externalData: any, userId: string | null) {
    const response = { ok: true, message: "Sync started in background" };

    const effectiveUserId = userId || "system-admin";

    this.saveExternalToLocal(externalData, effectiveUserId).catch((err) => {
      console.error("Background sync failed for MyHomeOS:", err);
    });

    return response;
  }

  private async saveExternalToLocal(data: any, userId: string) {
    const text = data.translations?.[0]?.text || "מוצר ללא שם";
    const brandName = data.defaultExtras?.brand || null;
    const imageUrl = data.imageUrl || null;
    const category = data.defaultCategory || "OTHER";

    const qNorm = normalizeText(text);
    const existing = await this.repo.suggest({ qNorm, lang: "he", limit: 1 });
    if (existing.length > 0) return existing[0];

    return this.create(
      {
        text,
        brandName,
        imageUrl,
        defaultCategory: category,
        scope: "GLOBAL",
      },
      userId,
    );
  }

  private mapExternalCategory(tags: string[]): ShoppingCategory {
    if (!tags || tags.length === 0) return "OTHER";

    // נאחד את כל הטאגים למחרוזת אחת לבדיקה מהירה
    const t = tags.join(",").toLowerCase();

    // בדיקה לפי סדר עדיפויות (מהספציפי לכללי)
    if (t.includes("vegetables")) return "VEGETABLES";
    if (t.includes("fruits")) return "FRUITS";
    if (t.includes("dairy") || t.includes("cheeses") || t.includes("yogurts"))
      return "DAIRY";
    if (t.includes("meat") || t.includes("fishes") || t.includes("seafood"))
      return "MEAT_FISH";
    if (t.includes("bakery") || t.includes("breads") || t.includes("pastries"))
      return "BAKERY";
    if (
      t.includes("breakfast cereals") ||
      t.includes("pasta") ||
      t.includes("rice") ||
      t.includes("flours")
    )
      return "PANTRY";
    if (
      t.includes("spices") ||
      t.includes("condiments") ||
      t.includes("sauces")
    )
      return "SPICES";
    if (t.includes("frozen")) return "FROZEN";
    if (t.includes("beverages") || t.includes("drinks") || t.includes("juices"))
      return "DRINKS";
    if (
      t.includes("snacks") ||
      t.includes("confectioneries") ||
      t.includes("biscuits")
    )
      return "SNACKS";
    if (t.includes("cleaning") || t.includes("detergents")) return "CLEANING";
    if (t.includes("baby foods")) return "BABY";
    if (t.includes("pharmacy") || t.includes("hygiene")) return "PHARM";

    return "OTHER";
  }
}
