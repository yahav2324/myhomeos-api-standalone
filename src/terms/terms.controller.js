import { __awaiter, __decorate, __metadata, __param } from "tslib";
import { Body, Controller, Get, Injectable, Param, Post, Put, Query, Req, UseGuards, } from '@nestjs/common';
import { TermsService } from './terms.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AuthGuard } from '@nestjs/passport';
function getUserIdOrNull(req) {
    var _a, _b;
    return (_b = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null;
}
function getUserIdOrThrow(req) {
    const id = getUserIdOrNull(req);
    if (!id)
        throw new Error('Unauthorized (missing req.user.id)');
    return id;
}
let OptionalJwtAuthGuard = class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err, user) {
        // אם אין טוקן / לא תקין – פשוט נחזיר null ולא נזרוק
        if (err)
            return null;
        return user !== null && user !== void 0 ? user : null;
    }
};
OptionalJwtAuthGuard = __decorate([
    Injectable()
], OptionalJwtAuthGuard);
export { OptionalJwtAuthGuard };
let TermsController = class TermsController {
    constructor(terms) {
        this.terms = terms;
    }
    setImage(id, body, req) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = getUserIdOrThrow(req);
            return this.terms.setTermImage(id, (_a = body.imageUrl) !== null && _a !== void 0 ? _a : null, userId);
        });
    }
    // GET /terms/suggest?q=ri&lang=en&limit=10
    suggest(q, lang, limit, req) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = getUserIdOrNull(req); // optional
            const lim = limit ? Number(limit) : 10;
            return {
                ok: true,
                data: yield this.terms.suggest({
                    q: q !== null && q !== void 0 ? q : '',
                    lang: (lang !== null && lang !== void 0 ? lang : 'en').toLowerCase(),
                    limit: Number.isFinite(lim) ? lim : 10,
                    userId,
                }),
            };
        });
    }
    // POST /terms  (requires auth)
    create(body, req) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = getUserIdOrThrow(req);
            return this.terms.create(body, userId);
        });
    }
    upsertMyDefaults(id, body, req) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = getUserIdOrThrow(req);
            return this.terms.upsertMyDefaults(id, body, userId);
        });
    }
    // POST /terms/:id/vote  (requires auth)
    vote(id, body, req) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = getUserIdOrThrow(req);
            return this.terms.vote(id, body, userId);
        });
    }
};
__decorate([
    UseGuards(JwtAuthGuard),
    Put('/terms/:id/image'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TermsController.prototype, "setImage", null);
__decorate([
    UseGuards(OptionalJwtAuthGuard),
    Get('/terms/suggest'),
    __param(0, Query('q')),
    __param(1, Query('lang')),
    __param(2, Query('limit')),
    __param(3, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], TermsController.prototype, "suggest", null);
__decorate([
    UseGuards(JwtAuthGuard),
    Post('/terms'),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TermsController.prototype, "create", null);
__decorate([
    UseGuards(JwtAuthGuard),
    Put('/terms/:id/my-defaults'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TermsController.prototype, "upsertMyDefaults", null);
__decorate([
    UseGuards(JwtAuthGuard),
    Post('/terms/:id/vote'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TermsController.prototype, "vote", null);
TermsController = __decorate([
    Controller(),
    __metadata("design:paramtypes", [TermsService])
], TermsController);
export { TermsController };
//# sourceMappingURL=terms.controller.js.map