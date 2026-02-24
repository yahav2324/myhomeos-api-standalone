"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleSmsSender = void 0;
class ConsoleSmsSender {
    async sendSms(toPhoneE164, message) {
        console.log(`[SMS to ${toPhoneE164}] ${message}`);
    }
}
exports.ConsoleSmsSender = ConsoleSmsSender;
//# sourceMappingURL=sms.sender.js.map