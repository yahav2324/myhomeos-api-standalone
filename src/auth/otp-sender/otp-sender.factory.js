import { ConsoleOtpSender } from './otp-sender.console';
import { WhatsAppOtpSender } from './otp-sender.whatsapp';
import { SmsOtpSender } from './otp-sender.sms';
export function createOtpSender() {
    var _a;
    const provider = (_a = process.env.OTP_PROVIDER) !== null && _a !== void 0 ? _a : 'console';
    switch (provider) {
        case 'whatsapp':
            return new WhatsAppOtpSender();
        case 'sms':
            return new SmsOtpSender();
        case 'console':
        default:
            return new ConsoleOtpSender();
    }
}
//# sourceMappingURL=otp-sender.factory.js.map