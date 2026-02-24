import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OtpStatus } from '@prisma/client';
let AuthRepoPrisma = class AuthRepoPrisma {
    constructor(prisma) {
        this.prisma = prisma;
    }
    upsertPendingChallenge(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            // if there is an existing PENDING, update it (resend)
            const existing = yield this.prisma.otpChallenge.findFirst({
                where: { phoneE164: args.phoneE164, status: OtpStatus.PENDING },
                orderBy: { createdAt: 'desc' },
            });
            if (existing) {
                const diffSec = Math.floor((now.getTime() - existing.updatedAt.getTime()) / 1000);
                if (diffSec < args.minResendSec) {
                    return {
                        kind: 'TOO_SOON',
                        challengeId: existing.id,
                        waitSec: args.minResendSec - diffSec,
                    };
                }
                const updated = yield this.prisma.otpChallenge.update({
                    where: { id: existing.id },
                    data: {
                        codeHash: args.codeHash,
                        expiresAt: args.expiresAt,
                        attempts: 0,
                        sentCount: { increment: 1 },
                        status: OtpStatus.PENDING,
                    },
                });
                return { kind: 'UPDATED', row: updated };
            }
            const created = yield this.prisma.otpChallenge.create({
                data: {
                    phoneE164: args.phoneE164,
                    purpose: args.purpose,
                    channel: args.channel,
                    codeHash: args.codeHash,
                    expiresAt: args.expiresAt,
                    status: OtpStatus.PENDING,
                },
            });
            return { kind: 'CREATED', row: created };
        });
    }
    getChallengeById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.otpChallenge.findUnique({ where: { id } });
        });
    }
    bumpAttempt(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.otpChallenge.update({
                where: { id },
                data: { attempts: { increment: 1 } },
            });
        });
    }
    markChallengeStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.otpChallenge.update({
                where: { id },
                data: { status },
            });
        });
    }
    findOrCreateUserByPhone(phoneE164) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!phoneE164)
                throw new Error('phoneE164 is required');
            return this.prisma.user.upsert({
                where: { phoneE164 },
                update: { lastLoginAt: new Date() },
                create: { phoneE164, lastLoginAt: new Date() },
            });
        });
    }
    upsertGoogleUser(args) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            return this.prisma.user.upsert({
                where: { googleSub: args.googleSub },
                create: {
                    googleSub: args.googleSub,
                    email: (_a = args.email) !== null && _a !== void 0 ? _a : undefined,
                    displayName: (_b = args.displayName) !== null && _b !== void 0 ? _b : undefined,
                    avatarUrl: (_c = args.avatarUrl) !== null && _c !== void 0 ? _c : undefined,
                    lastLoginAt: new Date(),
                },
                update: Object.assign(Object.assign(Object.assign(Object.assign({}, (args.email ? { email: args.email } : {})), (args.displayName ? { displayName: args.displayName } : {})), (args.avatarUrl ? { avatarUrl: args.avatarUrl } : {})), { lastLoginAt: new Date() }),
            });
        });
    }
    countActiveMemberships(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.householdMember.count({
                where: { userId, status: 'ACTIVE' },
            });
        });
    }
    createSession(args) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return this.prisma.authSession.create({
                data: {
                    userId: args.userId,
                    refreshTokenHash: args.refreshTokenHash,
                    deviceName: (_a = args.deviceName) !== null && _a !== void 0 ? _a : null,
                    expiresAt: args.expiresAt,
                    lastUsedAt: new Date(),
                },
            });
        });
    }
    findActiveSessionByHash(refreshTokenHash) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.authSession.findFirst({
                where: { refreshTokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
            });
        });
    }
    touchSession(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.authSession.update({
                where: { id },
                data: { lastUsedAt: new Date() },
            });
        });
    }
    revokeSession(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.authSession.update({
                where: { id },
                data: { revokedAt: new Date() },
            });
        });
    }
    revokeAllSessions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.authSession.updateMany({
                where: { userId, revokedAt: null },
                data: { revokedAt: new Date() },
            });
        });
    }
};
AuthRepoPrisma = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], AuthRepoPrisma);
export { AuthRepoPrisma };
//# sourceMappingURL=auth.repo.prisma.js.map