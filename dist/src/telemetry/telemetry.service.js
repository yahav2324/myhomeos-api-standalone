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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryService = void 0;
const common_1 = require("@nestjs/common");
const contracts_1 = require("../../internal-libs/contracts/src/index");
const boxes_service_1 = require("../boxes/boxes.service");
const telemetry_repo_prisma_1 = require("./telemetry.repo.prisma");
let TelemetryService = class TelemetryService {
    constructor(boxes, repo) {
        this.boxes = boxes;
        this.repo = repo;
    }
    async ingest(body) {
        const parsed = contracts_1.TelemetryIngestSchema.safeParse(body);
        if (!parsed.success)
            return { ok: false, errors: parsed.error.flatten() };
        const box = await this.boxes.findByDeviceId(parsed.data.deviceId);
        if (!box)
            throw new common_1.BadRequestException(`Unknown deviceId: ${parsed.data.deviceId}`);
        const t = parsed.data;
        const res = await this.boxes.applyTelemetryByDeviceId({
            quantity: t.quantity,
            deviceId: t.deviceId,
            timestamp: t.timestamp,
        });
        if (res.ok) {
            const b = res.data;
            const ts = t.timestamp ?? new Date().toISOString();
            await this.repo.append({
                boxId: box.id,
                quantity: b.quantity,
                percent: b.percent,
                state: b.state,
                timestamp: ts,
            });
        }
        return res;
    }
    async history(boxId, hours) {
        const h = Number(hours ?? 24);
        const safeH = Number.isFinite(h) && h > 0 ? h : 24;
        const since = new Date(Date.now() - safeH * 60 * 60 * 1000).toISOString();
        return { ok: true, data: await this.repo.list(boxId, since) };
    }
};
exports.TelemetryService = TelemetryService;
exports.TelemetryService = TelemetryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [boxes_service_1.BoxesService,
        telemetry_repo_prisma_1.TelemetryRepoPrisma])
], TelemetryService);
//# sourceMappingURL=telemetry.service.js.map