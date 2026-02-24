"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetFullSchema = void 0;
const zod_1 = require("zod");
exports.SetFullSchema = zod_1.default.object({
    fullQuantity: zod_1.default.number().positive(),
});
//# sourceMappingURL=set-full.schema.js.map