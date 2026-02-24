import { PrismaService } from "../prisma/prisma.service";
import { ShoppingCategory, ShoppingUnit, TermScope, TermStatus, VoteValue } from "@prisma/client";
export declare class TermsRepoPrisma {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSystemConfig(key: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        json: import("@prisma/client/runtime/client").JsonValue;
        key: string;
    }>;
    upsertSystemConfig(key: string, json: unknown): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        json: import("@prisma/client/runtime/client").JsonValue;
        key: string;
    }>;
    suggest(args: {
        qNorm: string;
        lang: string;
        limit: number;
        userId?: string | null;
    }): Promise<{
        id: string;
        text: string;
        normalized: string;
        status: import(".prisma/client").$Enums.TermStatus;
        upCount: number;
        downCount: number;
        myVote: import(".prisma/client").$Enums.VoteValue;
        category: import(".prisma/client").$Enums.ShoppingCategory;
        unit: string;
        qty: number;
        extras: any;
        imageUrl: any;
    }[]>;
    createTerm(args: {
        scope: TermScope;
        ownerUserId?: string | null;
        status: TermStatus;
        imageUrl?: string | null;
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
    }): Promise<any>;
    setTermImage(termId: string, imageUrl: string | null): Promise<{
        status: import(".prisma/client").$Enums.TermStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        ownerUserId: string | null;
        scope: import(".prisma/client").$Enums.TermScope;
        imageUrl: string | null;
        approvedByAdmin: boolean;
        approvedAt: Date | null;
        defaultCategory: import(".prisma/client").$Enums.ShoppingCategory | null;
        defaultUnit: import(".prisma/client").$Enums.ShoppingUnit | null;
        defaultQty: number | null;
        defaultExtras: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    addTranslation(args: {
        termId: string;
        lang: string;
        text: string;
        normalized: string;
        source: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        termId: string;
        lang: string;
        text: string;
        normalized: string;
        source: string;
    }>;
    upsertMyDefaults(args: {
        termId: string;
        userId: string;
        category: ShoppingCategory | null;
        unit: ShoppingUnit | null;
        qty: number | null;
        extras: Record<string, string> | null;
    }): Promise<{
        unit: import(".prisma/client").$Enums.ShoppingUnit | null;
        category: import(".prisma/client").$Enums.ShoppingCategory | null;
        qty: number | null;
        extras: import("@prisma/client/runtime/client").JsonValue | null;
        userId: string;
        termId: string;
    }>;
    findTermById(termId: string): Promise<{
        translations: {
            id: string;
            createdAt: Date;
            termId: string;
            lang: string;
            text: string;
            normalized: string;
            source: string;
        }[];
    } & {
        status: import(".prisma/client").$Enums.TermStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        ownerUserId: string | null;
        scope: import(".prisma/client").$Enums.TermScope;
        imageUrl: string | null;
        approvedByAdmin: boolean;
        approvedAt: Date | null;
        defaultCategory: import(".prisma/client").$Enums.ShoppingCategory | null;
        defaultUnit: import(".prisma/client").$Enums.ShoppingUnit | null;
        defaultQty: number | null;
        defaultExtras: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    upsertVote(args: {
        termId: string;
        userId: string;
        vote: VoteValue;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        termId: string;
        vote: import(".prisma/client").$Enums.VoteValue;
    }>;
    getVoteCounts(termId: string): Promise<{
        up: number;
        down: number;
    }>;
    updateTermStatus(termId: string, status: TermStatus, approvedAt?: Date | null): Promise<{
        status: import(".prisma/client").$Enums.TermStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        ownerUserId: string | null;
        scope: import(".prisma/client").$Enums.TermScope;
        imageUrl: string | null;
        approvedByAdmin: boolean;
        approvedAt: Date | null;
        defaultCategory: import(".prisma/client").$Enums.ShoppingCategory | null;
        defaultUnit: import(".prisma/client").$Enums.ShoppingUnit | null;
        defaultQty: number | null;
        defaultExtras: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
}
