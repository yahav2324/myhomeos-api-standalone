import { z } from "zod";
export declare const TelemetryIngestSchema: z.ZodEffects<z.ZodUnion<[z.ZodObject<{
    deviceId: z.ZodString;
    quantity: z.ZodNumber;
    percent: z.ZodOptional<z.ZodNumber>;
    state: z.ZodOptional<z.ZodEnum<["OK", "LOW", "EMPTY"]>>;
    timestamp: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    deviceId?: string;
    quantity?: number;
    percent?: number;
    state?: "OK" | "LOW" | "EMPTY";
    timestamp?: string;
}, {
    deviceId?: string;
    quantity?: number;
    percent?: number;
    state?: "OK" | "LOW" | "EMPTY";
    timestamp?: string;
}>, z.ZodObject<{
    hubId: z.ZodString;
    boxId: z.ZodString;
    receivedAtMs: z.ZodOptional<z.ZodNumber>;
    payload: z.ZodObject<{
        quantity: z.ZodNumber;
        percent: z.ZodOptional<z.ZodNumber>;
        state: z.ZodOptional<z.ZodEnum<["OK", "LOW", "EMPTY"]>>;
        unit: z.ZodOptional<z.ZodString>;
        ts: z.ZodOptional<z.ZodNumber>;
        boxId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        quantity?: number;
        percent?: number;
        state?: "OK" | "LOW" | "EMPTY";
        boxId?: string;
        unit?: string;
        ts?: number;
    }, {
        quantity?: number;
        percent?: number;
        state?: "OK" | "LOW" | "EMPTY";
        boxId?: string;
        unit?: string;
        ts?: number;
    }>;
}, "strip", z.ZodTypeAny, {
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
}, {
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
}>]>, {
    deviceId: string;
    quantity: number;
    percent: number;
    state: "OK" | "LOW" | "EMPTY";
    timestamp: string;
}, {
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
}>;
export type TelemetryNormalized = z.infer<typeof TelemetryIngestSchema>;
