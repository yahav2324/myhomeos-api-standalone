"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseOrThrow = parseOrThrow;
function parseOrThrow(schema, input) {
    const res = schema.safeParse(input);
    if (!res.success) {
        const message = res.error.issues.map((i) => i.message).join(', ');
        throw new Error(message);
    }
    return res.data;
}
//# sourceMappingURL=zod.js.map