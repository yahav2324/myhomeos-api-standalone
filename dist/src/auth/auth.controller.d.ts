import { AuthService } from "./auth.service";
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    google(body: {
        idToken: string;
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
    request(body: unknown): Promise<{
        challengeId: string;
        expiresInSec: number;
        waitSec: number;
    } | {
        challengeId: string;
        expiresInSec: number;
        waitSec?: undefined;
    }>;
    verify(body: unknown): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            phoneE164: string;
            activeHouseholdId: string;
        };
        needsOnboarding: boolean;
    }>;
    refresh(body: any): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(body: any): Promise<{
        ok: boolean;
    }>;
    logoutAll(userId: string): Promise<{
        ok: boolean;
    }>;
    me(userId: string): Promise<{
        userId: string;
    }>;
}
