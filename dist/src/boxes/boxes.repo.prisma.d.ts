import type { Box } from '@smart-kitchen/contracts';
import type { BoxesRepository } from './boxes.repository';
import { PrismaService } from '../prisma/prisma.service';
export declare class BoxesRepoPrisma implements BoxesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByCodeInHousehold(householdId: string, code: string): Promise<Box | null>;
    findAll(): Promise<Box[]>;
    findByIdInHousehold(householdId: string, id: string): Promise<Box | null>;
    findAllByHouseholdId(householdId: string): Promise<Box[]>;
    findByDeviceIdInHousehold(householdId: string, deviceId: string): Promise<Box | null>;
    findByDeviceId(deviceId: string): Promise<Box | null>;
    save(box: Box): Promise<Box>;
    deleteInHousehold(householdId: string, id: string): Promise<boolean>;
}
