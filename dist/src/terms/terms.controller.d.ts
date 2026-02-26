import { TermsService } from './terms.service';
declare const OptionalJwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class OptionalJwtAuthGuard extends OptionalJwtAuthGuard_base {
    handleRequest(err: any, user: any): any;
}
export declare class TermsController {
    private readonly terms;
    constructor(terms: TermsService);
    setImage(id: string, body: {
        imageUrl: string | null;
    }, req: any): Promise<{
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
    suggest(q: string, lang: string, limit: string, req: any): Promise<{
        ok: boolean;
        data: any[];
    }>;
    create(body: unknown, req: any): Promise<{
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
    upsertMyDefaults(id: string, body: unknown, req: any): Promise<{
        ok: boolean;
        data: {
            unit: import(".prisma/client").$Enums.ShoppingUnit | null;
            category: import(".prisma/client").$Enums.ShoppingCategory | null;
            qty: number | null;
            extras: import("@prisma/client/runtime/client").JsonValue | null;
            userId: string;
            termId: string;
            imageUrl: string | null;
        };
    }>;
    vote(id: string, body: unknown, req: any): Promise<{
        ok: boolean;
        data: {
            id: string;
            status: import(".prisma/client").$Enums.TermStatus;
            approvedAt: Date;
            upCount: number;
            downCount: number;
            myVote: "UP" | "DOWN";
            thresholds: {
                minQueryChars: number;
                upApproveMin: number;
                downRejectMin: number;
            };
        };
    }>;
}
export {};
