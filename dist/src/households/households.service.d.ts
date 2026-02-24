import { HouseholdsRepoPrisma } from './households.repo.prisma';
export declare class HouseholdsService {
    private readonly householdsRepo;
    constructor(householdsRepo: HouseholdsRepoPrisma);
    myHouseholds(userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createAsOwner(userId: string, name: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
