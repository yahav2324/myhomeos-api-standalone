import { __awaiter } from "tslib";
export class ConsoleOtpSender {
    sendOtp(toPhoneE164, code) {
        return __awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line no-console
            console.log(`[OTP][DEV] ${toPhoneE164} -> ${code}`);
        });
    }
}
//# sourceMappingURL=otp-sender.console.js.map