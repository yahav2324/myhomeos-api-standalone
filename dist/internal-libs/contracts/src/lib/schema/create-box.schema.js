"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBoxSchema = void 0;
const zod_1 = require("zod");
exports.CreateBoxSchema = zod_1.z.object({
    deviceId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    unit: zod_1.z.enum(['g', 'ml']),
    capacity: zod_1.z.number().positive().optional(),
});
//# sourceMappingURL=create-box.schema.js.map