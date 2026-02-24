import { __awaiter, __decorate } from "tslib";
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
let GoogleAuthService = class GoogleAuthService {
    constructor() {
        this.client = new OAuth2Client();
    }
    verify(idToken) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const audience = process.env.GOOGLE_WEB_CLIENT_ID;
            if (!audience)
                throw new Error('Missing GOOGLE_WEB_CLIENT_ID');
            const ticket = yield this.client.verifyIdToken({ idToken, audience });
            const payload = ticket.getPayload();
            if (!(payload === null || payload === void 0 ? void 0 : payload.sub))
                throw new UnauthorizedException('Invalid Google token');
            return {
                sub: payload.sub,
                email: (_a = payload.email) !== null && _a !== void 0 ? _a : null,
                name: (_b = payload.name) !== null && _b !== void 0 ? _b : null,
                picture: (_c = payload.picture) !== null && _c !== void 0 ? _c : null,
            };
        });
    }
};
GoogleAuthService = __decorate([
    Injectable()
], GoogleAuthService);
export { GoogleAuthService };
//# sourceMappingURL=google.auth.service.js.map