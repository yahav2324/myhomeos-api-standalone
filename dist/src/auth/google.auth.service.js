"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAuthService = void 0;
const common_1 = require("@nestjs/common");
const google_auth_library_1 = require("google-auth-library");
let GoogleAuthService = class GoogleAuthService {
    constructor() {
        this.client = new google_auth_library_1.OAuth2Client();
    }
    async verify(idToken) {
        const audience = process.env.GOOGLE_WEB_CLIENT_ID;
        if (!audience)
            throw new Error('Missing GOOGLE_WEB_CLIENT_ID');
        const ticket = await this.client.verifyIdToken({ idToken, audience });
        const payload = ticket.getPayload();
        if (!payload?.sub)
            throw new common_1.UnauthorizedException('Invalid Google token');
        return {
            sub: payload.sub,
            email: payload.email ?? null,
            name: payload.name ?? null,
            picture: payload.picture ?? null,
        };
    }
};
exports.GoogleAuthService = GoogleAuthService;
exports.GoogleAuthService = GoogleAuthService = __decorate([
    (0, common_1.Injectable)()
], GoogleAuthService);
//# sourceMappingURL=google.auth.service.js.map