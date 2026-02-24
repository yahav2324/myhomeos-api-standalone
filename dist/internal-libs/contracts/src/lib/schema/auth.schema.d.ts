import { z } from 'zod';
export declare const PhoneE164Schema: z.ZodString;
export declare const OtpRequestSchema: z.ZodObject<{
    phoneE164: z.ZodString;
    channel: z.ZodDefault<z.ZodEnum<["SMS"]>>;
}, "strip", z.ZodTypeAny, {
    phoneE164?: string;
    channel?: "SMS";
}, {
    phoneE164?: string;
    channel?: "SMS";
}>;
export declare const OtpVerifySchema: z.ZodObject<{
    challengeId: z.ZodString;
    code: z.ZodString;
    deviceName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    code?: string;
    challengeId?: string;
    deviceName?: string;
}, {
    code?: string;
    challengeId?: string;
    deviceName?: string;
}>;
export declare const AuthTokensSchema: z.ZodObject<{
    accessToken: z.ZodString;
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    accessToken?: string;
    refreshToken?: string;
}, {
    accessToken?: string;
    refreshToken?: string;
}>;
export type OtpRequestDto = z.infer<typeof OtpRequestSchema>;
export type OtpVerifyDto = z.infer<typeof OtpVerifySchema>;
export type AuthTokensDto = z.infer<typeof AuthTokensSchema>;
