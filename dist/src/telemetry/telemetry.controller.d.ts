import { TelemetryService } from './telemetry.service';
export declare class TelemetryController {
    private readonly service;
    constructor(service: TelemetryService);
    ingest(body: unknown): Promise<{
        ok: true;
        data: import("../../internal-libs/contracts/src").Box;
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
