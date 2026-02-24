import { TermsRepoPrisma } from './terms.repo.prisma';
type CatalogConfig = {
    minQueryChars: number;
    upApproveMin: number;
    downRejectMin: number;
};
export declare class TermsService {
    private readonly repo;
    constructor(repo: TermsRepoPrisma);
    getCatalogConfig(): Promise<CatalogConfig>;
    setTermImage(termId: string, imageUrl: string | null, userId: string): Promise<{
        ok: boolean;
        data: {
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
        };
    }>;
    suggest(args: {
        q: string;
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
    create(body: unknown, userId: string): Promise<{
        ok: boolean;
        data: {
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
        };
    }>;
    upsertMyDefaults(termId: string, body: unknown, userId: string): Promise<{
        ok: boolean;
        data: {
            unit: import(".prisma/client").$Enums.ShoppingUnit | null;
            category: import(".prisma/client").$Enums.ShoppingCategory | null;
            qty: number | null;
            extras: import("@prisma/client/runtime/client").JsonValue | null;
            userId: string;
            termId: string;
        };
    }>;
    vote(termId: string, body: unknown, userId: string): Promise<{
        ok: boolean;
        data: {
            id: string;
            status: import(".prisma/client").$Enums.TermStatus;
            approvedAt: Date;
            upCount: number;
            downCount: number;
            myVote: "UP" | "DOWN";
            thresholds: CatalogConfig;
        };
    }>;
}
export {};
