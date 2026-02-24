import { ShoppingService } from './shopping.service';
import { ShoppingCategory } from '@smart-kitchen/contracts';
type ApiUnit = 'PCS' | 'G' | 'KG' | 'ML' | 'L';
export declare class ShoppingController {
    private readonly shopping;
    constructor(shopping: ShoppingService);
    private getHouseholdId;
    listLists(req: any): Promise<{
        ok: boolean;
        data: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    createList(req: any, body: {
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
    renameList(req: any, id: string, body: {
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
    deleteList(req: any, id: string): Promise<{
        ok: boolean;
    }>;
    listItems(req: any, listId: string): Promise<{
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
    addItem(req: any, listId: string, body: {
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
    updateItem(req: any, listId: string, itemId: string, body: {
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
    setChecked(req: any, listId: string, itemId: string, body: {
        checked: boolean;
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
    deleteItem(req: any, listId: string, itemId: string): Promise<{
        ok: boolean;
    }>;
    importGuest(req: any, body: {
        lists: any[];
    }): Promise<{
        ok: boolean;
        data: {
            listIdMap: Record<string, string>;
            itemIdMap: Record<string, string>;
        };
    }>;
}
export {};
