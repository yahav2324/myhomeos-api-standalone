export interface SmsSender {
    sendSms(toPhoneE164: string, message: string): Promise<void>;
}
export declare class ConsoleSmsSender implements SmsSender {
    sendSms(toPhoneE164: string, message: string): Promise<void>;
}
