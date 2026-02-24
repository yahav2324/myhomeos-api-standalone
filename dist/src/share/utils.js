"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCode = makeCode;
exports.computeState = computeState;
exports.computePercent = computePercent;
exports.toContract = toContract;
function slugify(name) {
    return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}
function makeCode(name, existingCodes) {
    const base = slugify(name) || 'box';
    const sameBase = existingCodes.filter((c) => c === base || c.startsWith(`${base}-`));
    if (sameBase.length === 0)
        return `${base}-1`;
    let max = 0;
    for (const c of sameBase) {
        const m = c.match(new RegExp(`^${base}-(\\d+)$`));
        if (m)
            max = Math.max(max, Number(m[1]));
    }
    return `${base}-${max + 1}`;
}
function computeState(percent) {
    if (percent <= 0)
        return 'EMPTY';
    if (percent < 30)
        return 'LOW';
    return 'OK';
}
function computePercent(quantity, fullQuantity) {
    if (!fullQuantity || fullQuantity <= 0)
        return 0;
    const p = Math.round((quantity / fullQuantity) * 100);
    return Math.max(0, Math.min(100, p));
}
function toContract(row) {
    return {
        id: row.id,
        code: row.code,
        deviceId: row.deviceId,
        householdId: row.householdId,
        name: row.name,
        unit: row.unit,
        capacity: row.capacity ?? undefined,
        fullQuantity: row.fullQuantity ?? undefined,
        quantity: row.quantity,
        percent: row.percent,
        state: row.state,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        lastReadingAt: row.lastReadingAt ? row.lastReadingAt.toISOString() : undefined,
    };
}
//# sourceMappingURL=utils.js.map