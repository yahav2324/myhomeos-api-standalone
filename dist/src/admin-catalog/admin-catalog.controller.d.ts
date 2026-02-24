import { AdminCatalogService } from './admin-catalog.service';
export declare class AdminCatalogController {
    private readonly svc;
    constructor(svc: AdminCatalogService);
    get(): Promise<{
        ok: boolean;
        data: import("./admin-catalog.service").CatalogConfig;
    }>;
    patch(userId: string, body: unknown): Promise<{
        ok: boolean;
        data: import("./admin-catalog.service").CatalogConfig;
    }>;
}
