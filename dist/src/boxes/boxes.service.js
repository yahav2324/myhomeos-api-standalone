"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoxesService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const contracts_1 = require("../../internal-libs/contracts/src/index");
const utils_1 = require("../share/utils");
const boxes_gateway_1 = require("../ws/boxes.gateway");
let BoxesService = class BoxesService {
    constructor(repo, gateway) {
        this.repo = repo;
        this.gateway = gateway;
    }
    async list() {
        return this.repo.findAll();
    }
    async findAllForHousehold(householdId) {
        return this.repo.findAllByHouseholdId(householdId);
    }
    async findByDeviceId(deviceId) {
        return this.repo.findByDeviceId(deviceId);
    }
    async getForHousehold(householdId, id) {
        return this.repo.findByIdInHousehold(householdId, id);
    }
    async create(householdId, body) {
        const parsed = contracts_1.CreateBoxSchema.safeParse(body);
        if (!parsed.success)
            return { ok: false, errors: parsed.error.flatten() };
        const now = new Date().toISOString();
        const existingCodes = (await this.repo.findAllByHouseholdId(householdId)).map((b) => b.code);
        const box = {
            id: (0, crypto_1.randomUUID)(),
            householdId,
            code: (0, utils_1.makeCode)(parsed.data.name, existingCodes),
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
        const validated = contracts_1.BoxSchema.safeParse(box);
        if (!validated.success)
            return { ok: false, errors: validated.error.flatten() };
        const existingByDevice = await this.repo.findByDeviceIdInHousehold(householdId, parsed.data.deviceId);
        if (existingByDevice) {
            return {
                ok: false,
                errors: {
                    formErrors: ['Device already paired'],
                    fieldErrors: { deviceId: ['Already exists'] },
                },
            };
        }
        const saved = await this.repo.save(validated.data);
        this.gateway.upsert(saved);
        return { ok: true, data: saved };
    }
    async setFullForHousehold(householdId, id, body) {
        const existing = await this.repo.findByIdInHousehold(householdId, id);
        if (!existing) {
            return { ok: false, errors: { formErrors: ['Box not found'], fieldErrors: {} } };
        }
        const parsed = contracts_1.SetFullSchema.safeParse(body);
        if (!parsed.success)
            return { ok: false, errors: parsed.error.flatten() };
        if (existing.fullQuantity) {
            return {
                ok: false,
                errors: { formErrors: ['Full level already set (recalibrate later).'], fieldErrors: {} },
            };
        }
        const now = new Date().toISOString();
        const percent = (0, utils_1.computePercent)(existing.quantity, parsed.data.fullQuantity);
        const state = (0, utils_1.computeState)(percent);
        const updated = {
            ...existing,
            fullQuantity: parsed.data.fullQuantity,
            percent,
            state,
            updatedAt: now,
        };
        const validated = contracts_1.BoxSchema.safeParse(updated);
        if (!validated.success)
            return { ok: false, errors: validated.error.flatten() };
        const saved = await this.repo.save(validated.data);
        this.gateway.upsert(saved);
        return { ok: true, data: saved };
    }
    async recalibrateFullForHousehold(householdId, id, body) {
        const existing = await this.repo.findByIdInHousehold(householdId, id);
        if (!existing) {
            return { ok: false, errors: { formErrors: ['Box not found'], fieldErrors: {} } };
        }
        const parsed = contracts_1.SetFullSchema.safeParse(body);
        if (!parsed.success)
            return { ok: false, errors: parsed.error.flatten() };
        const now = new Date().toISOString();
        const percent = (0, utils_1.computePercent)(existing.quantity, parsed.data.fullQuantity);
        const state = (0, utils_1.computeState)(percent);
        const updated = {
            ...existing,
            fullQuantity: parsed.data.fullQuantity,
            percent,
            state,
            updatedAt: now,
        };
        const validated = contracts_1.BoxSchema.safeParse(updated);
        if (!validated.success)
            return { ok: false, errors: validated.error.flatten() };
        const saved = await this.repo.save(validated.data);
        this.gateway.upsert(saved);
        return { ok: true, data: saved };
    }
    async applyTelemetryByDeviceId(input) {
        const existing = await this.repo.findByDeviceId(input.deviceId);
        if (!existing) {
            return {
                ok: false,
                errors: { formErrors: ['Unknown deviceId (box not found)'], fieldErrors: {} },
            };
        }
        const now = new Date().toISOString();
        const ts = input.timestamp ?? now;
        const percent = (0, utils_1.computePercent)(input.quantity, existing.fullQuantity);
        const state = existing.fullQuantity ? (0, utils_1.computeState)(percent) : existing.state;
        const updated = {
            ...existing,
            quantity: input.quantity,
            percent,
            state,
            lastReadingAt: ts,
            updatedAt: existing.updatedAt,
        };
        const validated = contracts_1.BoxSchema.safeParse(updated);
        if (!validated.success)
            return { ok: false, errors: validated.error.flatten() };
        const saved = await this.repo.save(validated.data);
        this.gateway.upsert(saved);
        return { ok: true, data: saved };
    }
    async deleteBoxForHousehold(householdId, id) {
        const existing = await this.repo.findByIdInHousehold(householdId, id);
        if (!existing) {
            return { ok: false, errors: { formErrors: ['Box not found'], fieldErrors: {} } };
        }
        const deleted = await this.repo.deleteInHousehold(householdId, id);
        if (!deleted) {
            return { ok: false, errors: { formErrors: ['Delete failed'], fieldErrors: {} } };
        }
        this.gateway.delete({ id });
        return { ok: true };
    }
    async identifyBox(householdId, id) {
        const box = await this.repo.findByIdInHousehold(householdId, id);
        if (!box)
            return { ok: false, errors: { formErrors: ['Box not found'], fieldErrors: {} } };
        return this.gateway.emitIdentifyBox(id);
    }
    async setFullByCodeForHousehold(householdId, code, body) {
        const existing = await this.repo.findByCodeInHousehold(householdId, code);
        if (!existing) {
            return { ok: false, errors: { formErrors: ['Box not found'], fieldErrors: {} } };
        }
        return this.setFullForHousehold(householdId, existing.id, body);
    }
};
exports.BoxesService = BoxesService;
exports.BoxesService = BoxesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('BoxesRepository')),
    __metadata("design:paramtypes", [Object, boxes_gateway_1.BoxesGateway])
], BoxesService);
//# sourceMappingURL=boxes.service.js.map