"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoxSchema = exports.BoxStateEnum = void 0;
const zod_1 = require("zod");
exports.BoxStateEnum = zod_1.z.enum(['OK', 'LOW', 'EMPTY']);
exports.BoxSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    code: zod_1.z.string().min(2).max(40),
    name: zod_1.z.string().min(1),
    unit: zod_1.z.enum(['g', 'ml']),
    capacity: zod_1.z.number().positive().optional(),
    fullQuantity: zod_1.z.number().positive().optional(),
    quantity: zod_1.z.number().nonnegative().default(0),
    percent: zod_1.z.number().min(0).max(100).default(0),
    state: exports.BoxStateEnum.default('EMPTY'),
    deviceId: zod_1.z.string().min(1),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
    lastReadingAt: zod_1.z.string().datetime().optional(),
    householdId: zod_1.z.string().uuid(),
});
//# sourceMappingURL=box.schema.js.map