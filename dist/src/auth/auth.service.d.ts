import { JwtService } from '@nestjs/jwt';
import { AuthRepoPrisma } from './auth.repo.prisma';
import { GoogleAuthService } from './google.auth.service';
export declare class AuthService {
    private readonly repo;
    private readonly jwt;
    private readonly google;
    private readonly otpSender;
    constructor(repo: AuthRepoPrisma, jwt: JwtService, google: GoogleAuthService);
    private otpTtlSec;
    private otpMaxAttempts;
    private otpMinResendSec;
    private otpPepper;
    private refreshPepper;
    private accessTtlSec;
    private refreshTtlSec;
    requestOtp(phoneE164: string, channel: 'SMS'): Promise<{
        challengeId: string;
        expiresInSec: number;
        waitSec: number;
    } | {
        challengeId: string;
        expiresInSec: number;
        waitSec?: undefined;
    }>;
    verifyOtp(args: {
        challengeId: string;
        code: string;
        deviceName?: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            phoneE164: string;
            activeHouseholdId: string;
        };
        needsOnboarding: boolean;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string): Promise<{
        ok: boolean;
    }>;
    logoutAll(userId: string): Promise<{
        ok: boolean;
    }>;
    googleLogin(idToken: string, deviceName?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            phoneE164: string;
            activeHouseholdId: string;
        };
        needsOnboarding: boolean;
    }>;
}
