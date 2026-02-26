import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  ShoppingCategory,
  ShoppingUnit,
  TermScope,
  TermStatus,
  VoteValue,
} from "@prisma/client";

const unitToApi = (u: any): string | null => {
  if (!u) return null;
  const s = String(u);
  if (s === "PCS") return "pcs";
  if (s === "G") return "g";
  if (s === "KG") return "kg";
  if (s === "ML") return "ml";
  if (s === "L") return "l";
  return null;
};

function localNormalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "_");
}

@Injectable()
export class TermsRepoPrisma {
  constructor(private readonly prisma: PrismaService) {}

  // ---- System config ----
  async getSystemConfig(key: string) {
    return this.prisma.systemConfig.findUnique({ where: { key } });
  }

  async upsertSystemConfig(key: string, json: unknown) {
    return this.prisma.systemConfig.upsert({
      where: { key },
      update: { json: json as any },
      create: { key, json: json as any },
    });
  }

  async suggest(args: {
    qNorm: string;
    lang: string;
    limit: number;
    userId?: string | null;
  }) {
    const qNorm = (args.qNorm ?? "").trim();
    if (!qNorm) return [];

    const baseTermWhere = {
      OR: [
        {
          scope: TermScope.GLOBAL,
          status: { in: [TermStatus.LIVE, TermStatus.APPROVED] },
        },
        args.userId
          ? {
              scope: TermScope.PRIVATE,
              ownerUserId: args.userId,
              status: {
                in: [TermStatus.PENDING, TermStatus.LIVE, TermStatus.APPROVED],
              },
            }
          : undefined,
        args.userId
          ? {
              scope: TermScope.GLOBAL,
              status: TermStatus.PENDING,
              ownerUserId: args.userId,
            }
          : undefined,
      ].filter(Boolean) as any,
    };

    const termInclude = {
      term: {
        select: {
          id: true,
          scope: true,
          ownerUserId: true,
          status: true,
          imageUrl: true,
          approvedByAdmin: true,
          translations: { select: { lang: true, text: true } },
          brandImages: true,
        },
      },
    };

    // שלב 1: startsWith
    const starts = await this.prisma.termTranslation.findMany({
      where: {
        lang: args.lang,
        normalized: { startsWith: qNorm },
        term: baseTermWhere as any,
      },
      take: args.limit * 4,
      include: termInclude,
      orderBy: [{ normalized: "asc" }],
    });

    // שלב 2: contains (במידה וחסר)
    const needMore = starts.length < args.limit;
    const contains =
      needMore && qNorm.length >= 2
        ? await this.prisma.termTranslation.findMany({
            where: {
              lang: args.lang,
              normalized: { contains: qNorm },
              term: baseTermWhere as any,
            },
            take: args.limit * 12,
            include: termInclude,
            orderBy: [{ normalized: "asc" }],
          })
        : [];

    const matches = [...starts, ...contains];
    const termIds = Array.from(new Set(matches.map((m) => m.termId)));
    if (termIds.length === 0) return [];

    const myDefaults = args.userId
      ? await this.prisma.termUserDefaults.findMany({
          where: { userId: args.userId, termId: { in: termIds } },
          select: {
            termId: true,
            category: true,
            unit: true,
            qty: true,
            extras: true,
            imageUrl: true,
          },
        })
      : [];

    const myDefaultsByTerm = new Map(myDefaults.map((d) => [d.termId, d]));

    const grouped = await this.prisma.termVote.groupBy({
      by: ["termId", "vote"],
      where: { termId: { in: termIds } },
      _count: { _all: true },
    });

    const countsByTerm = new Map<string, { up: number; down: number }>();
    for (const g of grouped) {
      const cur = countsByTerm.get(g.termId) ?? { up: 0, down: 0 };
      if (g.vote === VoteValue.UP) cur.up = g._count._all;
      if (g.vote === VoteValue.DOWN) cur.down = g._count._all;
      countsByTerm.set(g.termId, cur);
    }

    const myVotes = args.userId
      ? await this.prisma.termVote.findMany({
          where: { termId: { in: termIds }, userId: args.userId },
          select: { termId: true, vote: true },
        })
      : [];

    const myVoteByTerm = new Map<string, VoteValue>();
    for (const v of myVotes) myVoteByTerm.set(v.termId, v.vote);

    // --- בניית הרשימה המשוטחת (Base + Brands) ---
    const out: any[] = [];

    for (const m of matches) {
      const t = m.term;
      const c = countsByTerm.get(t.id) ?? { up: 0, down: 0 };
      const d = args.userId ? myDefaultsByTerm.get(t.id) : null;

      const textLang =
        t.translations.find((x) => x.lang === args.lang)?.text ??
        t.translations.find((x) => x.lang === "en")?.text ??
        t.translations[0]?.text ??
        m.text;

      // 1. הוספת מוצר הבסיס (למשל: "חלב")
      out.push({
        id: t.id,
        text: textLang,
        normalized: m.normalized,
        status: t.status,
        upCount: c.up,
        downCount: c.down,
        myVote: args.userId ? (myVoteByTerm.get(t.id) ?? null) : null,
        category: d?.category ?? null,
        unit: unitToApi(d?.unit),
        qty: d?.qty ?? null,
        extras: (d?.extras as any) ?? {},
        imageUrl: d?.imageUrl ?? t.imageUrl ?? null,
      });

      // 2. הוספת כל מותג כשורה נפרדת (למשל: "חלב (יטבתה)")
      if (t.brandImages && t.brandImages.length > 0) {
        for (const bi of t.brandImages) {
          out.push({
            id: t.id,
            text: `${textLang} (${bi.brandName})`,
            normalized: `${m.normalized}_${bi.brandName.toLowerCase()}`,
            status: t.status,
            upCount: c.up,
            downCount: c.down,
            myVote: args.userId ? (myVoteByTerm.get(t.id) ?? null) : null,
            category: d?.category ?? null,
            unit: unitToApi(d?.unit),
            qty: d?.qty ?? null,
            // הזרקת המותג ל-extras כדי שהאפליקציה תדע לשמור אותו
            extras: { ...((d?.extras as any) ?? {}), brand: bi.brandName },
            imageUrl: bi.imageUrl,
          });
        }
      }
    }

    // דירוג
    out.sort((a, b) => {
      const aStarts = String(a.normalized ?? "").startsWith(qNorm) ? 1 : 0;
      const bStarts = String(b.normalized ?? "").startsWith(qNorm) ? 1 : 0;
      if (aStarts !== bStarts) return bStarts - aStarts;

      const rank = (s: any) =>
        s === TermStatus.APPROVED
          ? 3
          : s === TermStatus.LIVE
            ? 2
            : s === TermStatus.PENDING
              ? 1
              : 0;

      const ra = rank(a.status);
      const rb = rank(b.status);
      if (ra !== rb) return rb - ra;

      const sa = (a.upCount ?? 0) - (a.downCount ?? 0);
      const sb = (b.upCount ?? 0) - (b.downCount ?? 0);
      if (sa !== sb) return sb - sa;

      return String(a.text ?? "").localeCompare(String(b.text ?? ""));
    });

    // הסרת כפילויות סופית (Dedupe) והגבלת כמות (Limit)
    const seen = new Set<string>();
    const uniq: typeof out = [];

    for (const x of out) {
      // compositeKey משולב עם מותג כדי לאפשר הצגת מותגים שונים לאותו מוצר
      const brand = x.extras?.brand || "";
      const compositeKey = `${x.id}_${brand}`;

      if (seen.has(compositeKey)) continue;

      seen.add(compositeKey);
      uniq.push(x);

      if (uniq.length >= args.limit) break;
    }

    return uniq;
  }
  // ---- Create term + translations ----
  async createTerm(args: {
    scope: TermScope;
    ownerUserId?: string | null;
    status: TermStatus;
    imageUrl?: string | null; // ✅ הוסף
    defaultCategory?: ShoppingCategory | null;
    defaultUnit?: ShoppingUnit | null;
    defaultQty?: number | null;
    defaultExtras?: Record<string, string> | null;
    translations: Array<{
      lang: string;
      text: string;
      normalized: string;
      source: string;
    }>;
  }) {
    // ✅ מניעת כפולים:
    // אם כבר קיימת תרגום זהה (lang+normalized) לטֶרם גלובלי LIVE/APPROVED -> נחזיר אותו במקום ליצור חדש
    const first = args.translations[0];
    const brand = args.defaultExtras?.brand; // ✅ חילוץ המותג
    const existing = await this.prisma.termTranslation.findFirst({
      where: {
        lang: first.lang,
        normalized: first.normalized,
        term: {
          scope: args.scope,
          status: { in: [TermStatus.LIVE, TermStatus.APPROVED] },
        },
      },
      select: { termId: true },
    });

    if (existing?.termId && !brand) {
      const found = await this.findTermById(existing.termId);
      if (found) return found as any;
    }

    const translationsToCreate = args.translations.map((t) => {
      // אם יש מותג, אנחנו מצמידים אותו ל-normalized כדי למנוע את חסימת ה-DB
      // השתמשתי כאן ב-localNormalize כדי שלא תקבל שגיאת undefined
      const finalNormalized = brand
        ? `${t.normalized}_${localNormalize(String(brand))}`
        : t.normalized;

      return {
        lang: t.lang,
        text: t.text,
        normalized: finalNormalized,
        source: t.source,
      };
    });
    return this.prisma.term.create({
      data: {
        scope: args.scope,
        ownerUserId: args.ownerUserId ?? null,
        status: args.status,
        imageUrl: args.imageUrl ?? null,
        defaultCategory: args.defaultCategory ?? null,
        defaultUnit: args.defaultUnit ?? null,
        defaultQty: args.defaultQty ?? null,
        defaultExtras: args.defaultExtras ?? null,
        translations: {
          create: translationsToCreate,
        },
      },
      include: { translations: true },
    });
  }

  async setTermImage(termId: string, imageUrl: string | null) {
    return this.prisma.term.update({
      where: { id: termId },
      data: { imageUrl },
    });
  }

  async addTranslation(args: {
    termId: string;
    lang: string;
    text: string;
    normalized: string;
    source: string;
  }) {
    return this.prisma.termTranslation.create({
      data: {
        termId: args.termId,
        lang: args.lang,
        text: args.text,
        normalized: args.normalized,
        source: args.source,
      },
    });
  }

  async upsertMyDefaults(args: {
    termId: string;
    userId: string;
    category: ShoppingCategory | null;
    unit: ShoppingUnit | null;
    qty: number | null;
    extras: Record<string, string> | null;
  }) {
    return this.prisma.termUserDefaults.upsert({
      where: {
        userId_termId: { userId: args.userId, termId: args.termId },
      },
      update: {
        category: args.category,
        unit: args.unit,
        qty: args.qty,
        extras: args.extras,
      },
      create: {
        userId: args.userId,
        termId: args.termId,
        category: args.category,
        unit: args.unit,
        qty: args.qty,
        extras: args.extras,
      },
    });
  }

  async findTermById(termId: string) {
    return this.prisma.term.findUnique({
      where: { id: termId },
      include: { translations: true },
    });
  }

  // ---- Vote ----
  async upsertVote(args: { termId: string; userId: string; vote: VoteValue }) {
    return this.prisma.termVote.upsert({
      where: { termId_userId: { termId: args.termId, userId: args.userId } },
      update: { vote: args.vote },
      create: { termId: args.termId, userId: args.userId, vote: args.vote },
    });
  }

  async getVoteCounts(termId: string) {
    const grouped = await this.prisma.termVote.groupBy({
      by: ["vote"],
      where: { termId },
      _count: { _all: true },
    });

    let up = 0;
    let down = 0;
    for (const g of grouped) {
      if (g.vote === VoteValue.UP) up = g._count._all;
      if (g.vote === VoteValue.DOWN) down = g._count._all;
    }
    return { up, down };
  }

  async updateTermStatus(
    termId: string,
    status: TermStatus,
    approvedAt?: Date | null,
  ) {
    return this.prisma.term.update({
      where: { id: termId },
      data: { status, approvedAt: approvedAt ?? undefined },
    });
  }
}
