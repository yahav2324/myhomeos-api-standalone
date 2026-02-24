import { BoxesService } from './boxes.service';
export declare class BoxesController {
    private readonly service;
    constructor(service: BoxesService);
    create(householdId: string, body: unknown): Promise<{
        ok: true;
        data: import("../../internal-libs/contracts/src").Box;
    } | {
        ok: false;
        errors: any;
    }>;
    list(householdId: string): Promise<{
        ok: boolean;
        data: {
            deviceId?: string;
            quantity?: number;
            percent?: number;
            state?: "OK" | "LOW" | "EMPTY";
            code?: string;
            unit?: "g" | "ml";
            id?: string;
            name?: string;
            capacity?: number;
            fullQuantity?: number;
            createdAt?: string;
            updatedAt?: string;
            lastReadingAt?: string;
            householdId?: string;
        }[];
    }>;
    get(householdId: string, id: string): Promise<{
        ok: boolean;
        data: {
            deviceId?: string;
            quantity?: number;
            percent?: number;
            state?: "OK" | "LOW" | "EMPTY";
            code?: string;
            unit?: "g" | "ml";
            id?: string;
            name?: string;
            capacity?: number;
            fullQuantity?: number;
            createdAt?: string;
            updatedAt?: string;
            lastReadingAt?: string;
            householdId?: string;
        };
    }>;
    identify(householdId: string, id: string): Promise<{
        ok: boolean;
        data: {
            id: string;
            action: string;
        };
    }>;
    setFull(householdId: string, id: string, body: unknown): Promise<{
        ok: true;
        data: import("../../internal-libs/contracts/src").Box;
    } | {
        ok: false;
        errors: any;
    }>;
    recalibrateFull(householdId: string, id: string, body: unknown): Promise<{
        ok: true;
        data: import("../../internal-libs/contracts/src").Box;
    } | {
        ok: false;
        errors: any;
    }>;
    delete(householdId: string, id: string): Promise<{
        ok: true;
    } | {
        ok: false;
        errors: any;
    }>;
    setFullByCode(householdId: string, code: string, body: unknown): Promise<{
        ok: true;
        data: import("../../internal-libs/contracts/src").Box;
    } | {
        ok: false;
        errors: any;
    } | {
        ok: boolean;
        errors: {
            formErrors: string[];
            fieldErrors: {};
        };
    }>;
}
