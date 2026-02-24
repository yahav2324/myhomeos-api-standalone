import { __awaiter, __decorate, __metadata } from "tslib";
import { BadRequestException, Injectable } from '@nestjs/common';
import { TelemetryIngestSchema } from "../../internal-libs/contracts/src/index";
import { BoxesService } from '../boxes/boxes.service';
import { TelemetryRepoPrisma } from './telemetry.repo.prisma';
let TelemetryService = class TelemetryService {
    constructor(boxes, repo) {
        this.boxes = boxes;
        this.repo = repo;
    }
    ingest(body) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const parsed = TelemetryIngestSchema.safeParse(body);
            if (!parsed.success)
                return { ok: false, errors: parsed.error.flatten() };
            const box = yield this.boxes.findByDeviceId(parsed.data.deviceId);
            if (!box)
                throw new BadRequestException(`Unknown deviceId: ${parsed.data.deviceId}`);
            const t = parsed.data;
            // Box update + WS
            const res = yield this.boxes.applyTelemetryByDeviceId({
                quantity: t.quantity,
                deviceId: t.deviceId,
                timestamp: t.timestamp,
            });
            // אם הצליח — נרשום event ל-DB
            if (res.ok) {
                const b = res.data;
                const ts = (_a = t.timestamp) !== null && _a !== void 0 ? _a : new Date().toISOString();
                yield this.repo.append({
                    boxId: box.id,
                    quantity: b.quantity,
                    percent: b.percent,
                    state: b.state,
                    timestamp: ts,
                });
            }
            return res;
        });
    }
    history(boxId, hours) {
        return __awaiter(this, void 0, void 0, function* () {
            const h = Number(hours !== null && hours !== void 0 ? hours : 24);
            const safeH = Number.isFinite(h) && h > 0 ? h : 24;
            const since = new Date(Date.now() - safeH * 60 * 60 * 1000).toISOString();
            return { ok: true, data: yield this.repo.list(boxId, since) };
        });
    }
};
TelemetryService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [BoxesService,
        TelemetryRepoPrisma])
], TelemetryService);
export { TelemetryService };
//# sourceMappingURL=telemetry.service.js.map