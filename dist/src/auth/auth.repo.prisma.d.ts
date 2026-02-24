import { PrismaService } from '../prisma/prisma.service';
import { OtpChannel, OtpPurpose, OtpStatus } from '@prisma/client';
export declare class AuthRepoPrisma {
    private readonly prisma;
    constructor(prisma: PrismaService);
    upsertPendingChallenge(args: {
        phoneE164: string;
        purpose: OtpPurpose;
        channel: OtpChannel;
        codeHash: string;
        expiresAt: Date;
        minResendSec: number;
    }): Promise<{
        kind: "TOO_SOON";
        challengeId: string;
        waitSec: number;
        row?: undefined;
    } | {
        kind: "UPDATED";
        row: {
            status: import(".prisma/client").$Enums.OtpStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phoneE164: string;
            channel: import(".prisma/client").$Enums.OtpChannel;
            purpose: import(".prisma/client").$Enums.OtpPurpose;
            codeHash: string;
            expiresAt: Date;
            attempts: number;
            sentCount: number;
        };
        challengeId?: undefined;
        waitSec?: undefined;
    } | {
        kind: "CREATED";
        row: {
            status: import(".prisma/client").$Enums.OtpStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phoneE164: string;
            channel: import(".prisma/client").$Enums.OtpChannel;
            purpose: import(".prisma/client").$Enums.OtpPurpose;
            codeHash: string;
            expiresAt: Date;
            attempts: number;
            sentCount: number;
        };
        challengeId?: undefined;
        waitSec?: undefined;
    }>;
    getChallengeById(id: string): Promise<{
        status: import(".prisma/client").$Enums.OtpStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phoneE164: string;
        channel: import(".prisma/client").$Enums.OtpChannel;
        purpose: import(".prisma/client").$Enums.OtpPurpose;
        codeHash: string;
        expiresAt: Date;
        attempts: number;
        sentCount: number;
    }>;
    bumpAttempt(id: string): Promise<{
        status: import(".prisma/client").$Enums.OtpStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phoneE164: string;
        channel: import(".prisma/client").$Enums.OtpChannel;
        purpose: import(".prisma/client").$Enums.OtpPurpose;
        codeHash: string;
        expiresAt: Date;
        attempts: number;
        sentCount: number;
    }>;
    markChallengeStatus(id: string, status: OtpStatus): Promise<{
        status: import(".prisma/client").$Enums.OtpStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phoneE164: string;
        channel: import(".prisma/client").$Enums.OtpChannel;
        purpose: import(".prisma/client").$Enums.OtpPurpose;
        codeHash: string;
        expiresAt: Date;
        attempts: number;
        sentCount: number;
    }>;
    findOrCreateUserByPhone(phoneE164: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phoneE164: string | null;
        email: string | null;
        googleSub: string | null;
        displayName: string | null;
        avatarUrl: string | null;
        activeHouseholdId: string | null;
        lastLoginAt: Date | null;
        isAdmin: boolean;
        shoppingDefaults: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    upsertGoogleUser(args: {
        googleSub: string;
        email?: string | null;
        displayName?: string | null;
        avatarUrl?: string | null;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phoneE164: string | null;
        email: string | null;
        googleSub: string | null;
        displayName: string | null;
        avatarUrl: string | null;
        activeHouseholdId: string | null;
        lastLoginAt: Date | null;
        isAdmin: boolean;
        shoppingDefaults: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    countActiveMemberships(userId: string): Promise<number>;
    createSession(args: {
        userId: string;
        refreshTokenHash: string;
        deviceName?: string;
        expiresAt: Date;
    }): Promise<{
        id: string;
        createdAt: Date;
        deviceName: string | null;
        userId: string;
        expiresAt: Date;
        refreshTokenHash: string;
        lastUsedAt: Date;
        revokedAt: Date | null;
    }>;
    findActiveSessionByHash(refreshTokenHash: string): Promise<{
        id: string;
        createdAt: Date;
        deviceName: string | null;
        userId: string;
        expiresAt: Date;
        refreshTokenHash: string;
        lastUsedAt: Date;
        revokedAt: Date | null;
    }>;
    touchSession(id: string): Promise<{
        id: string;
        createdAt: Date;
        deviceName: string | null;
        userId: string;
        expiresAt: Date;
        refreshTokenHash: string;
        lastUsedAt: Date;
        revokedAt: Date | null;
    }>;
    revokeSession(id: string): Promise<{
        id: string;
        createdAt: Date;
        deviceName: string | null;
        userId: string;
        expiresAt: Date;
        refreshTokenHash: string;
        lastUsedAt: Date;
        revokedAt: Date | null;
    }>;
    revokeAllSessions(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
