"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateHouseholdSchema = void 0;
const zod_1 = require("zod");
exports.CreateHouseholdSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(60),
});
//# sourceMappingURL=households.schema.js.map