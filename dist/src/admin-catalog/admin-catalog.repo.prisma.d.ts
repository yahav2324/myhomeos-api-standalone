import { PrismaService } from '../prisma/prisma.service';
export declare class AdminCatalogRepoPrisma {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getConfigRow(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        json: import("@prisma/client/runtime/client").JsonValue;
    }>;
    upsertConfig(json: unknown): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        json: import("@prisma/client/runtime/client").JsonValue;
    }>;
    audit(args: {
        adminId: string;
        action: string;
        targetId?: string;
        before?: any;
        after?: any;
    }): Promise<{
        id: string;
        createdAt: Date;
        after: import("@prisma/client/runtime/client").JsonValue | null;
        adminId: string;
        action: string;
        targetId: string | null;
        before: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
}
