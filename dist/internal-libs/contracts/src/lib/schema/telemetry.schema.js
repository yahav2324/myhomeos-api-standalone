"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryIngestSchema = void 0;
const zod_1 = require("zod");
const SimpleSchema = zod_1.z.object({
    deviceId: zod_1.z.string().min(1),
    quantity: zod_1.z.number().nonnegative(),
    percent: zod_1.z.number().min(0).max(100).optional(),
    state: zod_1.z.enum(["OK", "LOW", "EMPTY"]).optional(),
    timestamp: zod_1.z.string().datetime().optional(),
});
const HubSchema = zod_1.z.object({
    hubId: zod_1.z.string().min(1),
    boxId: zod_1.z.string().min(1),
    receivedAtMs: zod_1.z.number().optional(),
    payload: zod_1.z.object({
        quantity: zod_1.z.number(),
        percent: zod_1.z.number().optional(),
        state: zod_1.z.enum(["OK", "LOW", "EMPTY"]).optional(),
        unit: zod_1.z.string().optional(),
        ts: zod_1.z.number().optional(),
        boxId: zod_1.z.string().optional(),
    }),
});
exports.TelemetryIngestSchema = zod_1.z
    .union([SimpleSchema, HubSchema])
    .transform((v) => {
    if ("deviceId" in v) {
        return {
            deviceId: v.deviceId,
            quantity: v.quantity,
            percent: v.percent ?? 0,
            state: v.state ?? "OK",
            timestamp: v.timestamp ?? new Date().toISOString(),
        };
    }
    const hub = v;
    return {
        deviceId: hub.boxId,
        quantity: hub.payload.quantity,
        percent: hub.payload.percent ?? 0,
        state: hub.payload.state ?? "OK",
        timestamp: new Date().toISOString(),
    };
});
//# sourceMappingURL=telemetry.schema.js.map