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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const auth_repo_prisma_1 = require("./auth.repo.prisma");
const auth_crypto_1 = require("./auth.crypto");
const otp_sender_factory_1 = require("./otp-sender/otp-sender.factory");
const google_auth_service_1 = require("./google.auth.service");
let AuthService = class AuthService {
    constructor(repo, jwt, google) {
        this.repo = repo;
        this.jwt = jwt;
        this.google = google;
        this.otpSender = (0, otp_sender_factory_1.createOtpSender)();
    }
    otpTtlSec() {
        return Number(process.env.OTP_TTL_SEC ?? '300');
    }
    otpMaxAttempts() {
        return Number(process.env.OTP_MAX_ATTEMPTS ?? '5');
    }
    otpMinResendSec() {
        return Number(process.env.OTP_MIN_RESEND_SEC ?? '45');
    }
    otpPepper() {
        return String(process.env.OTP_PEPPER ?? 'pepper');
    }
    refreshPepper() {
        return String(process.env.REFRESH_PEPPER ?? 'pepper');
    }
    accessTtlSec() {
        return Number(process.env.JWT_ACCESS_TTL_SEC ?? '1800');
    }
    refreshTtlSec() {
        return Number(process.env.JWT_REFRESH_TTL_SEC ?? '2592000');
    }
    async requestOtp(phoneE164, channel) {
        const code = (0, auth_crypto_1.generateOtp6)();
        const codeHash = (0, auth_crypto_1.makeOtpHash)(code, phoneE164, this.otpPepper());
        const expiresAt = new Date(Date.now() + this.otpTtlSec() * 1000);
        const res = await this.repo.upsertPendingChallenge({
            phoneE164,
            purpose: client_1.OtpPurpose.LOGIN,
            channel: channel === 'SMS' ? client_1.OtpChannel.SMS : client_1.OtpChannel.SMS,
            codeHash,
            expiresAt,
            minResendSec: this.otpMinResendSec(),
        });
        if (res.kind === 'TOO_SOON') {
            return { challengeId: res.challengeId, expiresInSec: this.otpTtlSec(), waitSec: res.waitSec };
        }
        const challengeId = res.row.id;
        await this.otpSender.sendOtp(phoneE164, code);
        return { challengeId, expiresInSec: this.otpTtlSec() };
    }
    async verifyOtp(args) {
        const ch = await this.repo.getChallengeById(args.challengeId);
        if (!ch)
            throw new common_1.UnauthorizedException('Invalid challenge');
        if (ch.status !== client_1.OtpStatus.PENDING)
            throw new common_1.UnauthorizedException('Challenge not pending');
        if (new Date() > ch.expiresAt) {
            await this.repo.markChallengeStatus(ch.id, client_1.OtpStatus.EXPIRED);
            throw new common_1.UnauthorizedException('OTP expired');
        }
        if (ch.attempts >= this.otpMaxAttempts()) {
            await this.repo.markChallengeStatus(ch.id, client_1.OtpStatus.LOCKED);
            throw new common_1.UnauthorizedException('Too many attempts');
        }
        const expectedHash = (0, auth_crypto_1.makeOtpHash)(args.code, ch.phoneE164, this.otpPepper());
        if (expectedHash !== ch.codeHash) {
            const bumped = await this.repo.bumpAttempt(ch.id);
            if (bumped.attempts >= this.otpMaxAttempts()) {
                await this.repo.markChallengeStatus(ch.id, client_1.OtpStatus.LOCKED);
            }
            throw new common_1.UnauthorizedException('Wrong code');
        }
        await this.repo.markChallengeStatus(ch.id, client_1.OtpStatus.VERIFIED);
        const user = await this.repo.findOrCreateUserByPhone(ch.phoneE164);
        const accessToken = await this.jwt.signAsync({ sub: user.id }, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: this.accessTtlSec() });
        const refreshToken = (0, auth_crypto_1.makeRefreshToken)();
        const refreshTokenHash = (0, auth_crypto_1.makeRefreshTokenHash)(refreshToken, this.refreshPepper());
        const expiresAt = new Date(Date.now() + this.refreshTtlSec() * 1000);
        await this.repo.createSession({
            userId: user.id,
            refreshTokenHash,
            deviceName: args.deviceName,
            expiresAt,
        });
        const needsOnboarding = !user.activeHouseholdId;
        return {
            accessToken,
            refreshToken,
            user: { id: user.id, phoneE164: user.phoneE164, activeHouseholdId: user.activeHouseholdId },
            needsOnboarding,
        };
    }
    async refresh(refreshToken) {
        if (!refreshToken)
            throw new common_1.BadRequestException('Missing refresh token');
        const hash = (0, auth_crypto_1.makeRefreshTokenHash)(refreshToken, this.refreshPepper());
        const session = await this.repo.findActiveSessionByHash(hash);
        if (!session)
            throw new common_1.UnauthorizedException('Invalid refresh token');
        await this.repo.touchSession(session.id);
        const accessToken = await this.jwt.signAsync({ sub: session.userId }, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: this.accessTtlSec() });
        await this.repo.revokeSession(session.id);
        const newRefresh = (0, auth_crypto_1.makeRefreshToken)();
        const newHash = (0, auth_crypto_1.makeRefreshTokenHash)(newRefresh, this.refreshPepper());
        const expiresAt = new Date(Date.now() + this.refreshTtlSec() * 1000);
        await this.repo.createSession({ userId: session.userId, refreshTokenHash: newHash, expiresAt });
        return { accessToken, refreshToken: newRefresh };
    }
    async logout(refreshToken) {
        const hash = (0, auth_crypto_1.makeRefreshTokenHash)(refreshToken, this.refreshPepper());
        const session = await this.repo.findActiveSessionByHash(hash);
        if (!session)
            return { ok: true };
        await this.repo.revokeSession(session.id);
        return { ok: true };
    }
    async logoutAll(userId) {
        await this.repo.revokeAllSessions(userId);
        return { ok: true };
    }
    async googleLogin(idToken, deviceName) {
        const gp = await this.google.verify(idToken);
        const user = await this.repo.upsertGoogleUser({
            googleSub: gp.sub,
            email: gp.email,
            displayName: gp.name,
            avatarUrl: gp.picture,
        });
        const needsOnboarding = !user.activeHouseholdId;
        const accessToken = await this.jwt.signAsync({ sub: user.id }, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: this.accessTtlSec() });
        const refreshToken = (0, auth_crypto_1.makeRefreshToken)();
        const refreshTokenHash = (0, auth_crypto_1.makeRefreshTokenHash)(refreshToken, this.refreshPepper());
        const expiresAt = new Date(Date.now() + this.refreshTtlSec() * 1000);
        await this.repo.createSession({
            userId: user.id,
            refreshTokenHash,
            deviceName,
            expiresAt,
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                phoneE164: user.phoneE164,
                activeHouseholdId: user.activeHouseholdId,
            },
            needsOnboarding,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_repo_prisma_1.AuthRepoPrisma,
        jwt_1.JwtService,
        google_auth_service_1.GoogleAuthService])
], AuthService);
//# sourceMappingURL=auth.service.js.map