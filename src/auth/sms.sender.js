import { __awaiter } from "tslib";
export class ConsoleSmsSender {
    sendSms(toPhoneE164, message) {
        return __awaiter(this, void 0, void 0, function* () {
            // DEV: prints to server log so you can test instantly
            // eslint-disable-next-line no-console
            console.log(`[SMS to ${toPhoneE164}] ${message}`);
        });
    }
}
//# sourceMappingURL=sms.sender.js.map