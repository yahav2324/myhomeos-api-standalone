import { z } from "zod";
const SimpleSchema = z.object({
    deviceId: z.string().min(1),
    quantity: z.number().nonnegative(),
    percent: z.number().min(0).max(100).optional(),
    state: z.enum(["OK", "LOW", "EMPTY"]).optional(),
    timestamp: z.string().datetime().optional(),
});
const HubSchema = z.object({
    hubId: z.string().min(1),
    boxId: z.string().min(1), // זה למעשה deviceId
    receivedAtMs: z.number().optional(),
    payload: z.object({
        quantity: z.number(),
        percent: z.number().optional(),
        state: z.enum(["OK", "LOW", "EMPTY"]).optional(),
        unit: z.string().optional(),
        ts: z.number().optional(),
        boxId: z.string().optional(),
    }),
});
export const TelemetryIngestSchema = z
    .union([SimpleSchema, HubSchema])
    .transform((v) => {
    var _a, _b, _c, _d, _e;
    // Simple
    if ("deviceId" in v) {
        return {
            deviceId: v.deviceId,
            quantity: v.quantity,
            percent: (_a = v.percent) !== null && _a !== void 0 ? _a : 0,
            state: (_b = v.state) !== null && _b !== void 0 ? _b : "OK",
            timestamp: (_c = v.timestamp) !== null && _c !== void 0 ? _c : new Date().toISOString(),
        };
    }
    // Hub - כאן אנחנו מבטיחים ל-TypeScript ש-v הוא HubSchema
    const hub = v;
    return {
        deviceId: hub.boxId, // SK-BOX-001
        quantity: hub.payload.quantity,
        percent: (_d = hub.payload.percent) !== null && _d !== void 0 ? _d : 0,
        state: (_e = hub.payload.state) !== null && _e !== void 0 ? _e : "OK",
        timestamp: new Date().toISOString(),
    };
});
//# sourceMappingURL=telemetry.schema.js.map