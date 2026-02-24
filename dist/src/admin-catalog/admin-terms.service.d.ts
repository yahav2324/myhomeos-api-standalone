import { AdminTermsRepoPrisma } from './admin-terms.repo.prisma';
import { AdminCatalogService } from './admin-catalog.service';
import { AdminCatalogRepoPrisma } from './admin-catalog.repo.prisma';
export declare class AdminTermsService {
    private readonly repo;
    private readonly cfg;
    private readonly audit;
    constructor(repo: AdminTermsRepoPrisma, cfg: AdminCatalogService, audit: AdminCatalogRepoPrisma);
    list(query: unknown): Promise<{
        ok: boolean;
        data: {
            items: {
                id: string;
                status: import(".prisma/client").$Enums.TermStatus;
                approvedByAdmin: boolean;
                text: string;
                upCount: number;
                downCount: number;
                translations: {
                    lang: string;
                    text: string;
                    source: string;
                }[];
                updatedAt: Date;
            }[];
            nextCursor: string;
        };
    }>;
    approve(adminId: string, termId: string): Promise<{
        ok: boolean;
    }>;
    reject(adminId: string, termId: string): Promise<{
        ok: boolean;
    }>;
    autoRemoveIfTooManyDown(adminId: string, termId: string): Promise<{
        ok: boolean;
        removed: boolean;
        downCount: number;
        threshold: number;
    }>;
}
