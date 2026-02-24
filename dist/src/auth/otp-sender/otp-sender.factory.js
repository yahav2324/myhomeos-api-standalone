"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOtpSender = createOtpSender;
const otp_sender_console_1 = require("./otp-sender.console");
const otp_sender_whatsapp_1 = require("./otp-sender.whatsapp");
const otp_sender_sms_1 = require("./otp-sender.sms");
function createOtpSender() {
    const provider = process.env.OTP_PROVIDER ?? 'console';
    switch (provider) {
        case 'whatsapp':
            return new otp_sender_whatsapp_1.WhatsAppOtpSender();
        case 'sms':
            return new otp_sender_sms_1.SmsOtpSender();
        case 'console':
        default:
            return new otp_sender_console_1.ConsoleOtpSender();
    }
}
//# sourceMappingURL=otp-sender.factory.js.map