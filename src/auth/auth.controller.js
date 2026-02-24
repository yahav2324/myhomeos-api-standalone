import { __awaiter, __decorate, __metadata, __param } from "tslib";
import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { OtpRequestSchema, OtpVerifySchema } from "../../internal-libs/contracts/src/index";
import { parseOrThrow } from "../common/zod";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt.guard";
import { CurrentUserId } from "./current-user.decorator";
let AuthController = class AuthController {
    constructor(auth) {
        this.auth = auth;
    }
    google(body) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.auth.googleLogin(body.idToken, body.deviceName);
        });
    }
    request(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const dto = parseOrThrow(OtpRequestSchema, body);
            return this.auth.requestOtp(dto.phoneE164, "SMS");
        });
    }
    verify(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const dto = parseOrThrow(OtpVerifySchema, body);
            return this.auth.verifyOtp(dto);
        });
    }
    refresh(body) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // body: { refreshToken }
            return this.auth.refresh(String((_a = body === null || body === void 0 ? void 0 : body.refreshToken) !== null && _a !== void 0 ? _a : ""));
        });
    }
    logout(body) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return this.auth.logout(String((_a = body === null || body === void 0 ? void 0 : body.refreshToken) !== null && _a !== void 0 ? _a : ""));
        });
    }
    logoutAll(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.auth.logoutAll(userId);
        });
    }
    me(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return { userId };
        });
    }
};
__decorate([
    Post("google"),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "google", null);
__decorate([
    Post("otp/request"),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "request", null);
__decorate([
    Post("otp/verify"),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify", null);
__decorate([
    Post("refresh"),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    Post("logout"),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    UseGuards(JwtAuthGuard),
    Post("logout-all"),
    __param(0, CurrentUserId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logoutAll", null);
__decorate([
    UseGuards(JwtAuthGuard),
    Get("me"),
    __param(0, CurrentUserId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
AuthController = __decorate([
    Controller("auth"),
    __metadata("design:paramtypes", [AuthService])
], AuthController);
export { AuthController };
//# sourceMappingURL=auth.controller.js.map