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
exports.AuthRepoPrisma = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AuthRepoPrisma = class AuthRepoPrisma {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upsertPendingChallenge(args) {
        const now = new Date();
        const existing = await this.prisma.otpChallenge.findFirst({
            where: { phoneE164: args.phoneE164, status: client_1.OtpStatus.PENDING },
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
            const updated = await this.prisma.otpChallenge.update({
                where: { id: existing.id },
                data: {
                    codeHash: args.codeHash,
                    expiresAt: args.expiresAt,
                    attempts: 0,
                    sentCount: { increment: 1 },
                    status: client_1.OtpStatus.PENDING,
                },
            });
            return { kind: 'UPDATED', row: updated };
        }
        const created = await this.prisma.otpChallenge.create({
            data: {
                phoneE164: args.phoneE164,
                purpose: args.purpose,
                channel: args.channel,
                codeHash: args.codeHash,
                expiresAt: args.expiresAt,
                status: client_1.OtpStatus.PENDING,
            },
        });
        return { kind: 'CREATED', row: created };
    }
    async getChallengeById(id) {
        return this.prisma.otpChallenge.findUnique({ where: { id } });
    }
    async bumpAttempt(id) {
        return this.prisma.otpChallenge.update({
            where: { id },
            data: { attempts: { increment: 1 } },
        });
    }
    async markChallengeStatus(id, status) {
        return this.prisma.otpChallenge.update({
            where: { id },
            data: { status },
        });
    }
    async findOrCreateUserByPhone(phoneE164) {
        if (!phoneE164)
            throw new Error('phoneE164 is required');
        return this.prisma.user.upsert({
            where: { phoneE164 },
            update: { lastLoginAt: new Date() },
            create: { phoneE164, lastLoginAt: new Date() },
        });
    }
    async upsertGoogleUser(args) {
        return this.prisma.user.upsert({
            where: { googleSub: args.googleSub },
            create: {
                googleSub: args.googleSub,
                email: args.email ?? undefined,
                displayName: args.displayName ?? undefined,
                avatarUrl: args.avatarUrl ?? undefined,
                lastLoginAt: new Date(),
            },
            update: {
                ...(args.email ? { email: args.email } : {}),
                ...(args.displayName ? { displayName: args.displayName } : {}),
                ...(args.avatarUrl ? { avatarUrl: args.avatarUrl } : {}),
                lastLoginAt: new Date(),
            },
        });
    }
    async countActiveMemberships(userId) {
        return this.prisma.householdMember.count({
            where: { userId, status: 'ACTIVE' },
        });
    }
    async createSession(args) {
        return this.prisma.authSession.create({
            data: {
                userId: args.userId,
                refreshTokenHash: args.refreshTokenHash,
                deviceName: args.deviceName ?? null,
                expiresAt: args.expiresAt,
                lastUsedAt: new Date(),
            },
        });
    }
    async findActiveSessionByHash(refreshTokenHash) {
        return this.prisma.authSession.findFirst({
            where: { refreshTokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
        });
    }
    async touchSession(id) {
        return this.prisma.authSession.update({
            where: { id },
            data: { lastUsedAt: new Date() },
        });
    }
    async revokeSession(id) {
        return this.prisma.authSession.update({
            where: { id },
            data: { revokedAt: new Date() },
        });
    }
    async revokeAllSessions(userId) {
        return this.prisma.authSession.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
};
exports.AuthRepoPrisma = AuthRepoPrisma;
exports.AuthRepoPrisma = AuthRepoPrisma = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthRepoPrisma);
//# sourceMappingURL=auth.repo.prisma.js.map