import { PrismaService } from '../prisma/prisma.service';
import { ShoppingCategory } from '@smart-kitchen/contracts';
type ApiUnit = 'PCS' | 'G' | 'KG' | 'ML' | 'L';
export declare class ShoppingService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listLists(householdId: string): Promise<{
        ok: boolean;
        data: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    createList(householdId: string, body: {
        name: string;
    }): Promise<{
        ok: boolean;
        data: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    renameList(householdId: string, listId: string, body: {
        name: string;
    }): Promise<{
        ok: boolean;
        data: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    deleteList(householdId: string, listId: string): Promise<{
        ok: boolean;
    }>;
    listItems(householdId: string, listId: string): Promise<{
        ok: boolean;
        data: {
            unit: import(".prisma/client").$Enums.ShoppingUnit;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            category: import(".prisma/client").$Enums.ShoppingCategory;
            qty: number;
            termId: string;
            text: string;
            imageUrl: string;
            checked: boolean;
            extra: import("@prisma/client/runtime/client").JsonValue;
        }[];
    }>;
    addItem(householdId: string, listId: string, body: {
        text: string;
        termId?: string;
        qty?: number;
        category?: ShoppingCategory;
        unit?: ApiUnit;
        extra?: any;
        imageUrl?: string | null;
    }): Promise<{
        ok: boolean;
        data: any;
    }>;
    updateItem(householdId: string, listId: string, itemId: string, body: {
        text?: string;
        qty?: number;
        unit?: ApiUnit;
        category?: ShoppingCategory | null;
        extra?: any | null;
        checked?: boolean;
        imageUrl?: string | null;
    }): Promise<{
        ok: boolean;
        data: {
            unit: import(".prisma/client").$Enums.ShoppingUnit;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            category: import(".prisma/client").$Enums.ShoppingCategory;
            qty: number;
            text: string;
            imageUrl: string;
            checked: boolean;
            extra: import("@prisma/client/runtime/client").JsonValue;
        };
    }>;
    deleteItem(householdId: string, listId: string, itemId: string): Promise<{
        ok: boolean;
    }>;
    private assertListOwned;
    private assertItemInList;
    private safeQty;
    private toPrismaUnit;
    importGuestData(householdId: string, body: {
        lists: Array<{
            listLocalId: string;
            name: string;
            items: any[];
        }>;
    }): Promise<{
        ok: boolean;
        data: {
            listIdMap: Record<string, string>;
            itemIdMap: Record<string, string>;
        };
    }>;
}
export {};
