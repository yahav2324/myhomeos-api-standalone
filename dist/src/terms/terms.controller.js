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
exports.TermsController = exports.OptionalJwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const terms_service_1 = require("./terms.service");
const jwt_guard_1 = require("../auth/jwt.guard");
const passport_1 = require("@nestjs/passport");
function getUserIdOrNull(req) {
    return req?.user?.id ?? null;
}
function getUserIdOrThrow(req) {
    const id = getUserIdOrNull(req);
    if (!id)
        throw new Error('Unauthorized (missing req.user.id)');
    return id;
}
let OptionalJwtAuthGuard = class OptionalJwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    handleRequest(err, user) {
        if (err)
            return null;
        return user ?? null;
    }
};
exports.OptionalJwtAuthGuard = OptionalJwtAuthGuard;
exports.OptionalJwtAuthGuard = OptionalJwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], OptionalJwtAuthGuard);
let TermsController = class TermsController {
    constructor(terms) {
        this.terms = terms;
    }
    async setImage(id, body, req) {
        const userId = getUserIdOrThrow(req);
        return this.terms.setTermImage(id, body.imageUrl ?? null, userId);
    }
    async suggest(q, lang, limit, req) {
        const userId = getUserIdOrNull(req);
        const lim = limit ? Number(limit) : 10;
        return {
            ok: true,
            data: await this.terms.suggest({
                q: q ?? '',
                lang: (lang ?? 'en').toLowerCase(),
                limit: Number.isFinite(lim) ? lim : 10,
                userId,
            }),
        };
    }
    async create(body, req) {
        const userId = getUserIdOrThrow(req);
        return this.terms.create(body, userId);
    }
    async upsertMyDefaults(id, body, req) {
        const userId = getUserIdOrThrow(req);
        return this.terms.upsertMyDefaults(id, body, userId);
    }
    async vote(id, body, req) {
        const userId = getUserIdOrThrow(req);
        return this.terms.vote(id, body, userId);
    }
};
exports.TermsController = TermsController;
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Put)('/terms/:id/image'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TermsController.prototype, "setImage", null);
__decorate([
    (0, common_1.UseGuards)(OptionalJwtAuthGuard),
    (0, common_1.Get)('/terms/suggest'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('lang')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], TermsController.prototype, "suggest", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Post)('/terms'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TermsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Put)('/terms/:id/my-defaults'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TermsController.prototype, "upsertMyDefaults", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Post)('/terms/:id/vote'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TermsController.prototype, "vote", null);
exports.TermsController = TermsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [terms_service_1.TermsService])
], TermsController);
//# sourceMappingURL=terms.controller.js.map