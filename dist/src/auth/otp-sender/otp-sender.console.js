"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleOtpSender = void 0;
class ConsoleOtpSender {
    async sendOtp(toPhoneE164, code) {
        console.log(`[OTP][DEV] ${toPhoneE164} -> ${code}`);
    }
}
exports.ConsoleOtpSender = ConsoleOtpSender;
//# sourceMappingURL=otp-sender.console.js.map