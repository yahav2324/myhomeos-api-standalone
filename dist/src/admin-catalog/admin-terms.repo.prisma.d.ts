import { PrismaService } from '../prisma/prisma.service';
import { TermStatus } from '@prisma/client';
export declare class AdminTermsRepoPrisma {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(args: {
        status: TermStatus;
        lang: string;
        q?: string;
        limit: number;
        cursor?: string;
    }): Promise<{
        rows: ({
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
        })[];
        nextCursor: string;
    }>;
    voteCounts(termId: string): Promise<{
        up: number;
        down: number;
    }>;
    getTerm(termId: string): Promise<{
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
    approve(termId: string): Promise<{
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
    reject(termId: string): Promise<{
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
    remove(termId: string): Promise<{
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
