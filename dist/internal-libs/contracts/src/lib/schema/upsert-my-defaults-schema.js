"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpsertMyDefaultsSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.UpsertMyDefaultsSchema = zod_1.default.object({
    category: zod_1.default.nativeEnum(client_1.ShoppingCategory).nullable().optional(),
    unit: zod_1.default.nativeEnum(client_1.ShoppingUnit).nullable().optional(),
    qty: zod_1.default.number().positive().nullable().optional(),
    extras: zod_1.default.record(zod_1.default.string(), zod_1.default.string()).nullable().optional(),
});
//# sourceMappingURL=upsert-my-defaults-schema.js.map