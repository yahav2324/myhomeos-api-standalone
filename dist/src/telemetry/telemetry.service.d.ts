import { BoxesService } from '../boxes/boxes.service';
import { TelemetryRepoPrisma } from './telemetry.repo.prisma';
export declare class TelemetryService {
    private readonly boxes;
    private readonly repo;
    constructor(boxes: BoxesService, repo: TelemetryRepoPrisma);
    ingest(body: unknown): Promise<{
        ok: true;
        data: import("@smart-kitchen/contracts").Box;
    } | {
        ok: false;
        errors: any;
    } | {
        ok: boolean;
        errors: import("zod").typeToFlattenedError<{
            deviceId?: string;
            quantity?: number;
            percent?: number;
            state?: "OK" | "LOW" | "EMPTY";
            timestamp?: string;
        } | {
            hubId?: string;
            boxId?: string;
            receivedAtMs?: number;
            payload?: {
                quantity?: number;
                percent?: number;
                state?: "OK" | "LOW" | "EMPTY";
                boxId?: string;
                unit?: string;
                ts?: number;
            };
        }, string>;
    }>;
    history(boxId: string, hours?: string): Promise<{
        ok: boolean;
        data: import("./telemetry.repo.prisma").TelemetryPoint[];
    }>;
}
