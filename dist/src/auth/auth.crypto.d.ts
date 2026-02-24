export declare function generateOtp6(): string;
export declare function sha256(input: string): string;
export declare function makeOtpHash(code: string, phoneE164: string, pepper: string): string;
export declare function makeRefreshToken(): string;
export declare function makeRefreshTokenHash(token: string, pepper: string): string;
