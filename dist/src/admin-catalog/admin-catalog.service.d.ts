import { AdminCatalogRepoPrisma } from './admin-catalog.repo.prisma';
export type CatalogConfig = {
    minQueryChars: number;
    upApproveMin: number;
    downRejectMin: number;
};
export declare class AdminCatalogService {
    private readonly repo;
    constructor(repo: AdminCatalogRepoPrisma);
    getConfig(): Promise<CatalogConfig>;
    patchConfig(adminId: string, body: unknown): Promise<CatalogConfig>;
}
