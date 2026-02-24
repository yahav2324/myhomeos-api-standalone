"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthTokensSchema = exports.OtpVerifySchema = exports.OtpRequestSchema = exports.PhoneE164Schema = void 0;
const zod_1 = require("zod");
exports.PhoneE164Schema = zod_1.z
    .string()
    .min(8)
    .regex(/^\+\d{8,15}$/, 'Phone must be E.164 format like +9725...');
exports.OtpRequestSchema = zod_1.z.object({
    phoneE164: exports.PhoneE164Schema,
    channel: zod_1.z.enum(['SMS']).default('SMS'),
});
exports.OtpVerifySchema = zod_1.z.object({
    challengeId: zod_1.z.string().uuid(),
    code: zod_1.z.string().regex(/^\d{6}$/, 'OTP code must be 6 digits'),
    deviceName: zod_1.z.string().min(1).max(80).optional(),
});
exports.AuthTokensSchema = zod_1.z.object({
    accessToken: zod_1.z.string(),
    refreshToken: zod_1.z.string(),
});
//# sourceMappingURL=auth.schema.js.map