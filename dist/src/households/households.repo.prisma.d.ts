import { PrismaService } from '../prisma/prisma.service';
export declare class HouseholdsRepoPrisma {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMyHouseholds(userId: string): Promise<({
        household: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        status: import(".prisma/client").$Enums.MemberStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        householdId: string;
        userId: string;
        role: import(".prisma/client").$Enums.HouseholdRole;
    })[]>;
    createHouseholdAsOwner(userId: string, name: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
