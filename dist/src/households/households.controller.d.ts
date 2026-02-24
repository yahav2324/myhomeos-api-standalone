import { HouseholdsService } from './households.service';
export declare class HouseholdsController {
    private readonly service;
    constructor(service: HouseholdsService);
    me(userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    create(userId: string, body: unknown): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
