import { __awaiter, __decorate, __metadata, __param } from "tslib";
import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { BoxSchema, CreateBoxSchema, SetFullSchema } from "../../internal-libs/contracts/src/index";
import { computePercent, computeState, makeCode } from '../share/utils';
import { BoxesGateway } from '../ws/boxes.gateway';
let BoxesService = class BoxesService {
    constructor(repo, gateway) {
        this.repo = repo;
        this.gateway = gateway;
    }
    /**
     * ✅ תמיד לעבוד לפי household.
     * השארתי את list() רק אם יש לך שימוש פנימי/legacy. מומלץ למחוק בסוף.
     */
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.repo.findAll();
        });
    }
    findAllForHousehold(householdId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.repo.findAllByHouseholdId(householdId);
        });
    }
    findByDeviceId(deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.repo.findByDeviceId(deviceId);
        });
    }
    getForHousehold(householdId, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.repo.findByIdInHousehold(householdId, id);
        });
    }
    create(householdId, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const parsed = CreateBoxSchema.safeParse(body);
            if (!parsed.success)
                return { ok: false, errors: parsed.error.flatten() };
            const now = new Date().toISOString();
            // ✅ קודים ייחודיים בתוך הבית
            const existingCodes = (yield this.repo.findAllByHouseholdId(householdId)).map((b) => b.code);
            const box = {
                id: randomUUID(),
                householdId,
                code: makeCode(parsed.data.name, existingCodes),
                deviceId: parsed.data.deviceId,
                name: parsed.data.name,
                unit: parsed.data.unit,
                capacity: parsed.data.capacity,
                fullQuantity: undefined,
                quantity: 0,
                percent: 0,
                state: 'EMPTY',
                createdAt: now,
                updatedAt: now,
                lastReadingAt: undefined,
            };
            const validated = BoxSchema.safeParse(box);
            if (!validated.success)
                return { ok: false, errors: validated.error.flatten() };
            // ✅ deviceId uniqueness בתוך אותו בית (למרות שב-DB הוא unique גלובלי אצלך)
            const existingByDevice = yield this.repo.findByDeviceIdInHousehold(householdId, parsed.data.deviceId);
            if (existingByDevice) {
                return {
                    ok: false,
                    errors: {
                        formErrors: ['Device already paired'],
                        fieldErrors: { deviceId: ['Already exists'] },
                    },
                };
            }
            const saved = yield this.repo.save(validated.data);
            this.gateway.upsert(saved);
            return { ok: true, data: saved };
        });
    }
    setFullForHousehold(householdId, id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield this.repo.findByIdInHousehold(householdId, id);
            if (!existing) {
                return { ok: false, errors: { formErrors: ['Box not found'], fieldErrors: {} } };
            }
            const parsed = SetFullSchema.safeParse(body);
            if (!parsed.success)
                return { ok: false, errors: parsed.error.flatten() };
            if (existing.fullQuantity) {
                return {
                    ok: false,
                    errors: { formErrors: ['Full level already set (recalibrate later).'], fieldErrors: {} },
                };
            }
            const now = new Date().toISOString();
            const percent = computePercent(existing.quantity, parsed.data.fullQuantity);
            const state = computeState(percent);
            const updated = Object.assign(Object.assign({}, existing), { fullQuantity: parsed.data.fullQuantity, percent,
                state, updatedAt: now });
            const validated = BoxSchema.safeParse(updated);
            if (!validated.success)
                return { ok: false, errors: validated.error.flatten() };
            const saved = yield this.repo.save(validated.data);
            this.gateway.upsert(saved);
            return { ok: true, data: saved };
        });
    }
    recalibrateFullForHousehold(householdId, id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield this.repo.findByIdInHousehold(householdId, id);
            if (!existing) {
                return { ok: false, errors: { formErrors: ['Box not found'], fieldErrors: {} } };
            }
            const parsed = SetFullSchema.safeParse(body);
            if (!parsed.success)
                return { ok: false, errors: parsed.error.flatten() };
            const now = new Date().toISOString();
            const percent = computePercent(existing.quantity, parsed.data.fullQuantity);
            const state = computeState(percent);
            const updated = Object.assign(Object.assign({}, existing), { fullQuantity: parsed.data.fullQuantity, // overwrite בכוונה
                percent,
                state, updatedAt: now });
            const validated = BoxSchema.safeParse(updated);
            if (!validated.success)
                return { ok: false, errors: validated.error.flatten() };
            const saved = yield this.repo.save(validated.data);
            this.gateway.upsert(saved);
            return { ok: true, data: saved };
        });
    }
    /**
     * נקודת כניסה לעדכון מה-Hub לפי deviceId.
     * אצלך deviceId הוא UNIQUE גלובלי, לכן זה עדיין תקין.
     */
    applyTelemetryByDeviceId(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const existing = yield this.repo.findByDeviceId(input.deviceId);
            if (!existing) {
                return {
                    ok: false,
                    errors: { formErrors: ['Unknown deviceId (box not found)'], fieldErrors: {} },
                };
            }
            const now = new Date().toISOString();
            const ts = (_a = input.timestamp) !== null && _a !== void 0 ? _a : now;
            const percent = computePercent(input.quantity, existing.fullQuantity);
            const state = existing.fullQuantity ? computeState(percent) : existing.state;
            const updated = Object.assign(Object.assign({}, existing), { quantity: input.quantity, percent,
                state, lastReadingAt: ts, updatedAt: existing.updatedAt });
            const validated = BoxSchema.safeParse(updated);
            if (!validated.success)
                return { ok: false, errors: validated.error.flatten() };
            const saved = yield this.repo.save(validated.data);
            this.gateway.upsert(saved);
            return { ok: true, data: saved };
        });
    }
    deleteBoxForHousehold(householdId, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield this.repo.findByIdInHousehold(householdId, id);
            if (!existing) {
                return { ok: false, errors: { formErrors: ['Box not found'], fieldErrors: {} } };
            }
            const deleted = yield this.repo.deleteInHousehold(householdId, id);
            if (!deleted) {
                return { ok: false, errors: { formErrors: ['Delete failed'], fieldErrors: {} } };
            }
            this.gateway.delete({ id });
            return { ok: true };
        });
    }
    identifyBox(householdId, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const box = yield this.repo.findByIdInHousehold(householdId, id);
            if (!box)
                return { ok: false, errors: { formErrors: ['Box not found'], fieldErrors: {} } };
            return this.gateway.emitIdentifyBox(id);
        });
    }
    setFullByCodeForHousehold(householdId, code, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield this.repo.findByCodeInHousehold(householdId, code);
            if (!existing) {
                return { ok: false, errors: { formErrors: ['Box not found'], fieldErrors: {} } };
            }
            return this.setFullForHousehold(householdId, existing.id, body);
        });
    }
};
BoxesService = __decorate([
    Injectable(),
    __param(0, Inject('BoxesRepository')),
    __metadata("design:paramtypes", [Object, BoxesGateway])
], BoxesService);
export { BoxesService };
//# sourceMappingURL=boxes.service.js.map