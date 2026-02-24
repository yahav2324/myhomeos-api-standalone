import { AdminTermsService } from './admin-terms.service';
export declare class AdminTermsController {
    private readonly svc;
    constructor(svc: AdminTermsService);
    list(query: any): Promise<{
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
    approve(req: any, id: string): Promise<{
        ok: boolean;
    }>;
    reject(req: any, id: string): Promise<{
        ok: boolean;
    }>;
    autoRemove(req: any, id: string): Promise<{
        ok: boolean;
        removed: boolean;
        downCount: number;
        threshold: number;
    }>;
}
