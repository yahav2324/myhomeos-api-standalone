import { PrismaService } from '../prisma/prisma.service';
export type TelemetryPoint = {
    boxId: string;
    quantity: number;
    percent: number;
    state: 'OK' | 'LOW' | 'EMPTY';
    timestamp: string;
};
export declare class TelemetryRepoPrisma {
    private readonly prisma;
    constructor(prisma: PrismaService);
    append(p: TelemetryPoint): Promise<void>;
    list(boxId: string, sinceIso?: string): Promise<TelemetryPoint[]>;
}
