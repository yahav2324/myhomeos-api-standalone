import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OtpChannel, OtpPurpose, OtpStatus } from '@prisma/client';
import { AuthRepoPrisma } from './auth.repo.prisma';
import { generateOtp6, makeOtpHash, makeRefreshToken, makeRefreshTokenHash } from './auth.crypto';
import { createOtpSender } from './otp-sender/otp-sender.factory';
import { GoogleAuthService } from './google.auth.service';
let AuthService = class AuthService {
    constructor(repo, jwt, google) {
        this.repo = repo;
        this.jwt = jwt;
        this.google = google;
        this.otpSender = createOtpSender();
    }
    otpTtlSec() {
        var _a;
        return Number((_a = process.env.OTP_TTL_SEC) !== null && _a !== void 0 ? _a : '300');
    }
    otpMaxAttempts() {
        var _a;
        return Number((_a = process.env.OTP_MAX_ATTEMPTS) !== null && _a !== void 0 ? _a : '5');
    }
    otpMinResendSec() {
        var _a;
        return Number((_a = process.env.OTP_MIN_RESEND_SEC) !== null && _a !== void 0 ? _a : '45');
    }
    otpPepper() {
        var _a;
        return String((_a = process.env.OTP_PEPPER) !== null && _a !== void 0 ? _a : 'pepper');
    }
    refreshPepper() {
        var _a;
        return String((_a = process.env.REFRESH_PEPPER) !== null && _a !== void 0 ? _a : 'pepper');
    }
    accessTtlSec() {
        var _a;
        return Number((_a = process.env.JWT_ACCESS_TTL_SEC) !== null && _a !== void 0 ? _a : '1800');
    }
    refreshTtlSec() {
        var _a;
        return Number((_a = process.env.JWT_REFRESH_TTL_SEC) !== null && _a !== void 0 ? _a : '2592000');
    }
    requestOtp(phoneE164, channel) {
        return __awaiter(this, void 0, void 0, function* () {
            const code = generateOtp6();
            const codeHash = makeOtpHash(code, phoneE164, this.otpPepper());
            const expiresAt = new Date(Date.now() + this.otpTtlSec() * 1000);
            const res = yield this.repo.upsertPendingChallenge({
                phoneE164,
                purpose: OtpPurpose.LOGIN,
                channel: channel === 'SMS' ? OtpChannel.SMS : OtpChannel.SMS,
                codeHash,
                expiresAt,
                minResendSec: this.otpMinResendSec(),
            });
            if (res.kind === 'TOO_SOON') {
                return { challengeId: res.challengeId, expiresInSec: this.otpTtlSec(), waitSec: res.waitSec };
            }
            const challengeId = res.row.id;
            yield this.otpSender.sendOtp(phoneE164, code);
            return { challengeId, expiresInSec: this.otpTtlSec() };
        });
    }
    verifyOtp(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const ch = yield this.repo.getChallengeById(args.challengeId);
            if (!ch)
                throw new UnauthorizedException('Invalid challenge');
            if (ch.status !== OtpStatus.PENDING)
                throw new UnauthorizedException('Challenge not pending');
            if (new Date() > ch.expiresAt) {
                yield this.repo.markChallengeStatus(ch.id, OtpStatus.EXPIRED);
                throw new UnauthorizedException('OTP expired');
            }
            if (ch.attempts >= this.otpMaxAttempts()) {
                yield this.repo.markChallengeStatus(ch.id, OtpStatus.LOCKED);
                throw new UnauthorizedException('Too many attempts');
            }
            const expectedHash = makeOtpHash(args.code, ch.phoneE164, this.otpPepper());
            if (expectedHash !== ch.codeHash) {
                const bumped = yield this.repo.bumpAttempt(ch.id);
                if (bumped.attempts >= this.otpMaxAttempts()) {
                    yield this.repo.markChallengeStatus(ch.id, OtpStatus.LOCKED);
                }
                throw new UnauthorizedException('Wrong code');
            }
            yield this.repo.markChallengeStatus(ch.id, OtpStatus.VERIFIED);
            const user = yield this.repo.findOrCreateUserByPhone(ch.phoneE164);
            const accessToken = yield this.jwt.signAsync({ sub: user.id }, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: this.accessTtlSec() });
            const refreshToken = makeRefreshToken();
            const refreshTokenHash = makeRefreshTokenHash(refreshToken, this.refreshPepper());
            const expiresAt = new Date(Date.now() + this.refreshTtlSec() * 1000);
            yield this.repo.createSession({
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
        });
    }
    refresh(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!refreshToken)
                throw new BadRequestException('Missing refresh token');
            const hash = makeRefreshTokenHash(refreshToken, this.refreshPepper());
            const session = yield this.repo.findActiveSessionByHash(hash);
            if (!session)
                throw new UnauthorizedException('Invalid refresh token');
            yield this.repo.touchSession(session.id);
            const accessToken = yield this.jwt.signAsync({ sub: session.userId }, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: this.accessTtlSec() });
            // rotate refresh token (recommended)
            yield this.repo.revokeSession(session.id);
            const newRefresh = makeRefreshToken();
            const newHash = makeRefreshTokenHash(newRefresh, this.refreshPepper());
            const expiresAt = new Date(Date.now() + this.refreshTtlSec() * 1000);
            yield this.repo.createSession({ userId: session.userId, refreshTokenHash: newHash, expiresAt });
            return { accessToken, refreshToken: newRefresh };
        });
    }
    logout(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const hash = makeRefreshTokenHash(refreshToken, this.refreshPepper());
            const session = yield this.repo.findActiveSessionByHash(hash);
            if (!session)
                return { ok: true };
            yield this.repo.revokeSession(session.id);
            return { ok: true };
        });
    }
    logoutAll(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.repo.revokeAllSessions(userId);
            return { ok: true };
        });
    }
    googleLogin(idToken, deviceName) {
        return __awaiter(this, void 0, void 0, function* () {
            const gp = yield this.google.verify(idToken);
            const user = yield this.repo.upsertGoogleUser({
                googleSub: gp.sub,
                email: gp.email,
                displayName: gp.name,
                avatarUrl: gp.picture,
            });
            // אם אתה רוצה לשמור את אותו “סגנון” כמו OTP:
            // needsOnboarding = !activeHouseholdId
            // (זה תלוי איך אתה מנהל activeHouseholdId. כרגע אצלך ב-OTP זה זה.)
            const needsOnboarding = !user.activeHouseholdId;
            const accessToken = yield this.jwt.signAsync({ sub: user.id }, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: this.accessTtlSec() });
            // ✅ אותו מנגנון refresh כמו OTP כדי ש-refresh/logout יעבדו
            const refreshToken = makeRefreshToken();
            const refreshTokenHash = makeRefreshTokenHash(refreshToken, this.refreshPepper());
            const expiresAt = new Date(Date.now() + this.refreshTtlSec() * 1000);
            yield this.repo.createSession({
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
        });
    }
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [AuthRepoPrisma,
        JwtService,
        GoogleAuthService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map